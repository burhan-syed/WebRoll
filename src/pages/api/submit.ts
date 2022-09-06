import prisma from "../../server/utils/prisma";
import fetchMetadata from "../../server/metaparser/parse";
import { makeUrlSecure } from "../../server/metaparser/utils";
import Filter from "bad-words";

const captchaSecret = import.meta.env.HCAPTCHA_SECRET;
const isPROD = import.meta.env.PROD;

export async function post({ request }: any) {
  // const test = await prisma.site.create({
  //   data: {
  //     name: "Reddit - Dive into anything",
  //     url: "https://reddit.com",
  //     description: "Reddit is a network of communities where people can dive into their interests, hobbies and passions. There\x1Bs a community for whatever you\x1Bre interested in on Reddit.",
  //     submitterIP: "127.0.0.1",
  //     categories: { connect: { category: "People & Society" } },
  //     tags: {
  //       connectOrCreate: ["REDDIT", "INTERNET", "MEME"].map(t => ({where: {tag: t}, create: {tag: t}}))
  //     },
  //   },
  // });
  // console.log("insert?", test);
  // return new Response(JSON.stringify({}), { status: 200 });

  const data = await request.json();

  const { tags, url, category, privacy, sourceLink, captchaToken, userIP } =
    data;
  console.log(userIP, tags, url, category, privacy, sourceLink);

  if (!url || !category || !(tags.length > 3) || !captchaToken) {
    return new Response(
      JSON.stringify({ ERROR: "required value not provided" }),
      { status: 401 }
    );
  }

  try {
    const options = {
      method: "POST",
    };
    const cResponse = await fetch(
      `https://hcaptcha.com/siteverify?response=${captchaToken}&secret=${captchaSecret}&remoteip${userIP}`,
      options
    );
    if (!cResponse.ok) {
      return new Response(
        JSON.stringify({ ERROR: "unable to verify captcha" }),
        { status: 401 }
      );
    }
  } catch (err) {
    console.log("CAPTCHA ERR:", err);
    return new Response(JSON.stringify({ ERROR: "unable to verify captcha" }), {
      status: 401,
    });
  }

  const extractUrl = (url: string) => {
    let urlCopy = url;
    if (urlCopy.includes("http")) {
      urlCopy = makeUrlSecure(url);
    } else {
      urlCopy = `https://${urlCopy}`;
    }
    let pathArray = urlCopy.split("/");
    let protocol = pathArray[0];
    let host = pathArray[2];
    return `${protocol}//${host}`;
  };
  const baseUrl = extractUrl(url);

  let filter = new Filter({});
  let cleanedTags = [] as string[];
  tags.forEach((tag: { name: string }, i: number) => {
    if (i === tags.length - 1) return;
    let r = filter.clean(tag.name);
    if (!r.includes("*") && r.length > 0) {
      cleanedTags.push(r.toUpperCase());
    }
  });

  try {
    //console.log("URL:", baseUrl);
    const { metadata, resURL } = await fetchMetadata(baseUrl);

    try {
      const pData = await prisma.site.findFirst({
        where: { url: resURL },
        select: {
          url: true,
          name: true,
          description: true,
          categories: { select: { category: true } },
          tags: { select: { tag: true } },
        },
      });
      if (pData) {
        return new Response(
          JSON.stringify({ ERROR: "site already exists", data: pData }),
          {
            status: 401,
          }
        );
      }
    } catch (err) {
      console.log("FIND ERR:", err);
      return new Response(JSON.stringify({ ERROR: "problem validating" }), {
        status: 500,
      });
    }

    try {
      const description = metadata["description"];
      const title = metadata["SiteTitle"] ?? resURL.split(".")?.[1] ?? resURL;
      console.log("try create..", {
        url: resURL,
        submitterIP: userIP,
        name: title,
        description: description,
        categories: { connect: { category: category } },
        tags: cleanedTags,
      });
      const create = await prisma.site.create({
        data: {
          url: resURL,
          submitterIP: userIP,
          name: title,
          description: description,
          categories: { connect: { category: category } },
          tags: {
            connectOrCreate: cleanedTags.map((tag: string) => ({
              where: { tag: tag },
              create: { tag: tag },
            })),
          },
        },
        select: {
          url: true,
          name: true,
          description: true,
          categories: { select: { category: true, description: true } },
          tags: { select: { tag: true } },
        },
      });
      console.log("Create:", create);
      return new Response(JSON.stringify({ data: {...create} }), { status: 200 });
    } catch (err) {
      console.log("CREATE ERR:", err);
      return new Response(JSON.stringify({ ERROR: "Error adding site" }), {
        status: 500,
      });
    }
  } catch (err) {
    console.log("FETCH ERR:", err);
    return new Response(JSON.stringify({ ERROR: "Unable to fetch url" }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
    status: 500,
  });
}
