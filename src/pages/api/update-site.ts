import type { SiteStatus } from "@prisma/client";
import type { APIRoute } from "astro";
import { parseTags } from "../../server/metaparser/utils";
import prisma from "../../server/utils/prisma";

const key = import.meta.env.MY_SECRET_KEY;

export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  console.log("RESPONSE RECEIVED", data);

  const { siteData, secret, assigner } = data as {
    siteData: {
      id: string;
      description?: string;
      status: SiteStatus;
      name?: string;
      imgKey?: string;
      allowEmbed?: boolean;
      sourceLink?: string;
      categories?: string[];
      tags?: string[];
    };
    secret: string;
    assigner: string;
  };
  if (secret !== key) {
    return new Response(null, { status: 401 });
  }
  if (siteData?.id && secret === key && assigner) {
    try {
      const { cleanedTags } = parseTags(
        siteData?.tags?.map((tag) => ({ name: tag })) ?? [{ name: "" }]
      );

      const update = await prisma.sites.update({
        where: { id: siteData.id },
        data: {
          ...siteData,
          categories: {
            connect: siteData.categories?.map((category) => ({
              category: category,
            })),
          },
          tags: {
            connectOrCreate: cleanedTags.map((tag: string) => ({
              where: { siteID_tagID: { siteID: siteData.id, tagID: tag } },
              create: {
                tag: { create: { tag: tag } },
                // site: { connect: { id: siteId } },
                assigner: { connect: { id: assigner } },
              },
            })),
          },
        },
      });

      console.log("site update!", update)

      return new Response(JSON.stringify({ data: {} }), {
        status: 200,
      });
    } catch (err) {
      return new Response(JSON.stringify({ ERROR: "" }), { status: 500 });
    }
  }
  return new Response(JSON.stringify({ ERROR: "" }), { status: 400 });
};
