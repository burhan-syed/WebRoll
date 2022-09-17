import type { SiteStatus, TagStatus } from "@prisma/client";
import type { APIRoute } from "astro";
import { parseTags } from "../../server/metaparser/utils";
import prisma from "../../server/utils/prisma";

const key = import.meta.env.MY_SECRET_KEY;

export const post: APIRoute = async function post({ request }) {
  console.log("RECEIVING RESPONSE..")
  const data = await request.json();
  console.log("RESPONSE RECEIVED", data);

  const { siteData, secret, assigner, removedTags, newTagStatus, updatedTags } = data as {
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
    removedTags?:string[];
    updatedTags?:string[]; 
    newTagStatus?:TagStatus
  };
  if (secret !== key) {
    return new Response(null, { status: 401 });
  }
  if (siteData?.id && secret === key && assigner) {
    try {
      const { cleanedTags } = parseTags(
        siteData?.tags?.map((tag) => ({ name: tag })) ?? [{ name: "" }]
      );

      if(removedTags){
        await prisma.siteTags.deleteMany({where: {siteID: siteData.id, tagID: {in: removedTags} }})
      }
      if(updatedTags){
        await prisma.siteTags.updateMany({where: {siteID: siteData.id, tagID: {in: updatedTags}}, data: {status: newTagStatus}})
      }

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
                tag: {
                  connectOrCreate: {
                    where: { tag: tag },
                    create: { tag: tag,},
                  },
                },
                assigner: { connect: { id: assigner } },

              }
            })),
          },
        },
      });

      console.log("site update!", update);

      return new Response(JSON.stringify({ data: {} }), {
        status: 200,
      });
    } catch (err) {
      console.log("update error", err);
      return new Response(JSON.stringify({ ERROR: "" }), { status: 500 });
    }
  }
  return new Response(JSON.stringify({ ERROR: "" }), { status: 400 });
};
