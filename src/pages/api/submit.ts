import prisma from "../../server/utils/prisma";
import fetchMetadata from "../../server/metaparser/parse";
import { makeUrlSecure } from "../../server/metaparser/utils";
import Filter from "bad-words";
import { generateId } from "../../server/utils/generateSiteId";

const captchaSecret = import.meta.env.HCAPTCHA_SECRET;
const parseDomain = import.meta.env.PARSER_DOMAIN; 
const isPROD = import.meta.env.PROD;

export async function post({ request }: any) {
  const data = await request.json();

  const { tags, url, category, privacy, sourceLink, captchaToken, userIP } =
    data;
  console.log(userIP, tags, url, category, privacy, sourceLink, captchaToken);

  if (!url || !category || !(tags.length > 3) || !captchaToken) {
    return new Response(
      JSON.stringify({ ERROR: "required data not provided" }),
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
  let invalidTags = [] as string[]; 
  const checkTag = (tag: string) => {
    let checkedTag = filter
      .clean(tag)
      ?.replaceAll("*", "")
      ?.trim()
      ?.toUpperCase();
    if (
      checkedTag.match(/[A-Z ]/)?.[0]?.length === checkTag.length &&
      checkedTag.length <= 48 &&
      checkedTag?.replaceAll(" ", "").length >= 2
    ) {
      return checkedTag;
    }
    return "";
  };
  tags.forEach((tag: { name: string }, i: number) => {
    if (i === tags.length - 1) return;
    let checked = checkTag(tag.name);
    if (checked) {
      cleanedTags.push(checked);
    }else{
      invalidTags.push(tag.name); 
    }
  });
  console.log(cleanedTags); 
  if (invalidTags.length > 0) {
    return new Response(
      JSON.stringify({
        ERROR: `${invalidTags.length} invalid tag${invalidTags.length === 1 ? "" : "s"}: ${invalidTags.join(",")}`,
      }),
      { status: 400 }
    );
  }
  try {
    //console.log("URL:", baseUrl);
    const resURL = (await fetch(baseUrl)).url;

    try {
      const pData = await prisma.site.findFirst({
        where: { url: resURL },
        select: {
          id:true,
          url: true,
          name: true,
          description: true,
          status: true,
          imgKey: true,
          sourceLink: true,
          categories: { select: { category: true } },
          tags: { select: { tag: true } },
        },
      });
      if (pData) {
        console.log("SITE EXISTS");

        return new Response(
          JSON.stringify({ ERROR: "site previously submitted", data: pData }),
          {
            status: 400,
          }
        );
      }
    } catch (err) {
      console.log("FIND ERR:", err);
      return new Response(JSON.stringify({ ERROR: "problem validating" }), {
        status: 500,
      });
    }
    const res = await fetch(true ? `${parseDomain}/api/parse` : 'http://localhost:3001/api/parse-data', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({url: baseUrl, key: "akey"}),
    })
    console.log("res?", res);

    if(!res.ok){
      return new Response(JSON.stringify({ERROR: "couldn't parse site"}), {status: 500})
    }

    const data = await res.json(); 
    console.log("data:", data); 
    const { description, title, imgKey } = data;
    // const { description, title, imgKey } = await fetchMetadata(
    //   baseUrl
    // );
    const siteId = generateId(); 
    try {
      // const description = metadata["description"];
      // const title = metadata["SiteTitle"] ?? resURL.split(".")?.[1] ?? resURL;
      // console.log("try create..", {
      //   url: resURL,
      //   submitterIP: userIP,
      //   name: title,
      //   description: description,
      //   categories: { connect: { category: category } },
      //   tags: cleanedTags,
      // });
      const create = await prisma.site.create({
        data: {
          id: siteId,
          url: resURL,
          submitterIP: userIP,
          name: title,
          description: description,
          imgKey,
          sourceLink,
          categories: { connect: { category: category } },
          tags: {
            connectOrCreate: cleanedTags.map((tag: string) => ({
              where: { tag: tag },
              create: { tag: tag },
            })),
          },
        },
        select: {
          id: true,
          url: true,
          name: true,
          description: true,
          status: true,
          imgKey: true,
          sourceLink: true,
          categories: { select: { category: true, description: true } },
          tags: { select: { tag: true } },
        },
      });
      console.log("Create:", create);
      return new Response(JSON.stringify({ data: { ...create } }), {
        status: 200,
      });
    } catch (err) {
      console.log("CREATE ERR:", err);
      return new Response(JSON.stringify({ ERROR: "Server Error" }), {
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
