import prisma from "../../server/utils/prisma";
import parseMetadata from "../../server/metaparser/parse";
import { extractUrl, parseTags } from "../../server/metaparser/utils";
import Filter from "bad-words";
import { generateId } from "../../server/utils/generateSiteId";
import type { APIRoute } from "astro";

const captchaSecret = import.meta.env.HCAPTCHA_SECRET;
const parseDomain = import.meta.env.PARSER_DOMAIN;
const key = import.meta.env.MY_SECRET_KEY;
const isPROD = import.meta.env.PROD;

export const post: APIRoute = async function post({ request }) {
  const data = await request.json();

  const {
    tags,
    url,
    category,
    privacy,
    sourceLink,
    captchaToken,
    userIP,
    sessionID,
  } = data;
  // console.log(userIP, tags, url, category, privacy, sourceLink, captchaToken);

  if (!url || !category || !(tags.length > 3) || !captchaToken || !sessionID) {
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

  const { cleanedTags, invalidTags } = parseTags(tags);

  //console.log(cleanedTags);
  if (invalidTags.length > 0) {
    return new Response(
      JSON.stringify({
        ERROR: `${invalidTags.length} invalid tag${
          invalidTags.length === 1 ? "" : "s"
        }: ${invalidTags.join(",")}`,
      }),
      { status: 400 }
    );
  }
  try {
    //console.log("URL:", baseUrl);
    const response = await fetch(baseUrl);
    const resURL = response.url;
    const xFrameOptions = response.headers?.get("X-Frame-Options");
    //console.log("headers?", response.headers, xFrameOptions );
    const allowEmbed = !(
      xFrameOptions === "DENY" ||
      xFrameOptions === "SAMEORIGIN" ||
      xFrameOptions === "ALLOW-FROM"
    );

    try {
      const pData = await prisma.sites.findFirst({
        where: { url: resURL },
        select: {
          id: true,
          imgKey: true,
          url: true,
          name: true,
          description: true,
          allowEmbed: true,
          categories: { select: { category: true } },
          likes: { where: { sessionId: sessionID } },
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

    const siteID = generateId();

    // console.log("res?", res);

    // if (!res.ok) {
    //   return new Response(JSON.stringify({ ERROR: "couldn't parse site" }), {
    //     status: 500,
    //   });
    // }

    // const data = await res.json();
    // console.log("data:", data);
    // const { description, title, imgKey } = data;

    const { description, title } = await parseMetadata(response);
    console.log("metadata", siteID, description, title);
    try {
      const create = await prisma.sites.create({
        data: {
          id: siteID,
          url: resURL,
          submitterIP: userIP,
          submitter: { connect: { id: sessionID } },
          allowEmbed,
          name: title ?? resURL?.replaceAll("https://", ""),
          description: description,
          //imgKey,
          sourceLink,
          categories: { connect: { category: category } },
          tags: {
            connectOrCreate: cleanedTags.map((tag: string) => ({
              where: { siteID_tagID: { siteID: siteID, tagID: tag } },
              // connect: {tag: {connect: {tag: tag}, assigner: {connect: {id: sessionID}}}},
              create: {
                tag: { create: { tag: tag } },
                // site: { connect: { id: siteId } },
                assigner: { connect: { id: sessionID } },
              },
            })),
          },
        },
        // select: {
        //   id: true,
        //   url: true,
        //   name: true,
        //   description: true,
        //   status: true,
        //   imgKey: true,
        //   allowEmbed: true,
        //   sourceLink: true,
        //   categories: { select: { category: true, description: true } },
        //   tags: { select: { tag: true } },
        // },
        select: {
          id: true,
          imgKey: true,
          url: true,
          name: true,
          description: true,
          allowEmbed: true,
          categories: { select: { category: true } },
          likes: { where: { sessionId: sessionID } },
        },
      });
      console.log("Create:", create);
      try{
        const res = fetch(
          parseDomain,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: resURL,
              key: key,
              siteID: siteID,
              assigner: sessionID,
            }),
          }
        );
      }catch(err){
        console.error("pasre post error", err)
      }
      
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
};
