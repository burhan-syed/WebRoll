import prisma from "../../server/utils/prisma";
import fetchMetadata from "../../server/metaparser/parse";
import { extractUrl, parseTags } from "../../server/metaparser/utils";
import Filter from "bad-words";
import { generateId } from "../../server/utils/generateSiteId";

const captchaSecret = import.meta.env.HCAPTCHA_SECRET;
const parseDomain = import.meta.env.PARSER_DOMAIN; 
const isPROD = import.meta.env.PROD;

export async function post({ request }: any) {
  const data = await request.json();

  const { tags, url, category, privacy, sourceLink, captchaToken, userIP } =
    data;
  // console.log(userIP, tags, url, category, privacy, sourceLink, captchaToken);

  if (!url || !category || !(tags.length > 3) || !captchaToken) {
    return new Response(
      JSON.stringify({ ERROR: "required data not provided" }),
      { status: 400 }
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

  const baseUrl = extractUrl(url);

  const {cleanedTags, invalidTags} = parseTags(tags);

  //console.log(cleanedTags); 
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
    const response = (await fetch(baseUrl));
    const resURL = response.url; 
    const xFrameOptions = response.headers?.get('X-Frame-Options');
    //console.log("headers?", response.headers, xFrameOptions );
    const allowEmbed = !(xFrameOptions === "DENY" || xFrameOptions === "SAMEORIGIN" || xFrameOptions === "ALLOW-FROM"); 

    try {
      const pData = await prisma.site.findFirst({
        where: { url: resURL },
        select: {
          id:true,
          url: true,
          name: true,
          allowEmbed: true,
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
      const create = await prisma.site.create({
        data: {
          id: siteId,
          url: resURL,
          submitterIP: userIP,
          allowEmbed,
          name: title ?? resURL?.replaceAll("https://", ""),
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
          allowEmbed: true,
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
      status: 400,
    });
  }

  return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
    status: 500,
  });
}
