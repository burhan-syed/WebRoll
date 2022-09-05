import prisma from "../../server/utils/prisma";
import fetchMetadata from "../../server/metaparser/parse";
import { makeUrlSecure } from "../../server/metaparser/utils";
import Filter from "bad-words";

const captchaSecret = import.meta.env.HCAPTCHA_SECRET;
const isPROD = import.meta.env.PROD;

export async function post({ request }: any) {
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
      `https://hcaptcha.com/siteverify?response=${captchaToken}&secret=${captchaSecret}&remoteip${ip}`,
      options
    );
    if (!cResponse.ok) {
      return new Response(
        JSON.stringify({ ERROR: "unable to verify captcha" }),
        { status: 401 }
      );
    }
  } catch (err) {
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

  try {
    const pData = await prisma.site.findFirst({ where: { url: baseUrl } });
    if (pData) {
      return new Response(JSON.stringify({ ERROR: "site already exists" }), {
        status: 401,
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ ERROR: "problem validating" }), {
      status: 500,
    });
  }

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
    console.log("URL:", baseUrl);
    const meta = await fetchMetadata(baseUrl);
    console.log("meta?", meta);

    try {
      const description = meta["description"];
      const title = meta["SiteTitle"];

      prisma.site.create({
        data: {
          url: baseUrl,
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
      });
    } catch (err) {
      return new Response(JSON.stringify({ ERROR: "Error adding site" }), {
        status: 500,
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ ERROR: "Unable to fetch url" }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
    status: 500,
  });
}
