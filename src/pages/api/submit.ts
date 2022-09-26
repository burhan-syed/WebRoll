import prisma from "../../server/utils/prisma";
import parseMetadata from "../../server/metaparser/parse";
import { extractUrl, parseTags, splitUrl } from "../../server/metaparser/utils";
import { generateSiteId } from "../../server/utils/generateIDs";
import type { APIRoute } from "astro";
import { getWebRollSession } from "../../server/utils/parseCookieString";
import postParseRequest from "../../server/metaparser/parseRequest";
import type { Categories } from "@prisma/client";

const captchaSecret = import.meta.env.HCAPTCHA_SECRET;

export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  const sessionID = getWebRollSession(request.headers.get("cookie"));
  const userIP = (request as any)?.[
    Symbol.for("astro.clientAddress")
  ] as string;

  const { tags, url, categories, privacy, sourceLink, captchaToken } = data;
  console.log(userIP, tags, url, categories, privacy, sourceLink, captchaToken);

  if (
    !url ||
    !categories ||
    !(tags.length > 3) ||
    !captchaToken ||
    !sessionID
  ) {
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
    const response = await fetch(baseUrl);
    const resURL = splitUrl(response.url)?.host ?? baseUrl;
    const xFrameOptions = response.headers?.get("X-Frame-Options");
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
          status: true,
          categories: { select: { category: true } },
        },
      });
      if (pData) {
        console.log("SITE EXISTS");
        if (pData?.status === "BANNED") {
          return new Response(
            JSON.stringify({ ERROR: "we can't index this url" }),
            { status: 400 }
          );
        }
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

    const siteID = generateSiteId();

    const { description, title } = await parseMetadata(response);
    console.log("metadata", siteID, description, title, resURL);
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
          categories: {
            connect: [
              ...categories
                .filter((c: string) => c)
                .map((c: string) => ({ category: c })),
            ],
          },
          tags: {
            connectOrCreate: cleanedTags.map((tag: string) => ({
              where: { siteID_tagID: { siteID: siteID, tagID: tag } },
              create: {
                tag: {
                  connectOrCreate: {
                    where: { tag: tag },
                    create: { tag: tag },
                  },
                },
                assigner: { connect: { id: sessionID } },
              },
            })),
          },
        },
        select: {
          id: true,
          imgKey: true,
          url: true,
          name: true,
          description: true,
          allowEmbed: true,
          status: true,
          categories: { select: { category: true } },
        },
      });
      console.log("Create:", create);
      try {
        const res = postParseRequest({
          siteURL: resURL,
          siteID: siteID,
          assignerID: sessionID,
        });
        // const res = fetch(parseDomain, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     url: resURL,
        //     key: key,
        //     siteID: siteID,
        //     assigner: sessionID,
        //   }),
        // });
      } catch (err) {
        console.error("parse post error", err);
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
