import { getUser } from "@astro-auth/core";
import type { SiteStatus } from "@prisma/client";
import type { APIRoute } from "astro";
import { diffTags } from "../../server/utils/db";
import prisma from "../../server/utils/prisma";
import type { User } from "../../types";

const key = import.meta.env.MY_SECRET_KEY;

export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  const user = getUser({ server: request }) as User;
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
      url?: string;
    };
    secret?: string;
    assigner?: string;
  };
  if (secret !== key && user?.role !== "ADMIN") {
    return new Response(null, { status: 401 });
  }
  const useAssigner = assigner ?? user.session;
  if (siteData.tags && !useAssigner) {
    return new Response("missing tag assigner", { status: 400 });
  }
  const useCategories = siteData.categories?.filter((c) => c);
  if (siteData?.id) {
    try {

      if (useAssigner && siteData.tags) {
        const { removedTags, newTags } = await diffTags({
          siteID: siteData.id,
          tags: siteData.tags,
        });
        //console.log("removed?", removedTags, "new?", newTags, "raw?", siteData.tags)

        if (useCategories) {
          let update = await prisma.$transaction([
            prisma.sites.update({
              where: { id: siteData.id },
              data: { categories: { set: [] } },
            }),
            prisma.siteTags.deleteMany({
              where: { siteID: siteData.id, tagID: { in: removedTags } },
            }),
            prisma.sites.update({
              where: { id: siteData.id },
              data: {
                ...siteData,
                updatedAt: new Date(),
                categories: {
                  connect: useCategories?.map((category) => ({
                    category: category,
                  })),
                },
                tags: {
                  connectOrCreate: newTags.map((tag: string) => ({
                    where: {
                      siteID_tagID: { siteID: siteData.id, tagID: tag },
                    },
                    create: {
                      tag: {
                        connectOrCreate: {
                          where: { tag: tag },
                          create: { tag: tag },
                        },
                      },
                      assigner: { connect: { id: useAssigner } },
                    },
                  })),
                },
              },
            }),
          ]);
          return new Response(JSON.stringify({ data: { ...update[2] } }), {
            status: 200,
          });
        } else {
          let update = await prisma.$transaction([
            prisma.siteTags.deleteMany({
              where: { siteID: siteData.id, tagID: { in: removedTags } },
            }),
            prisma.sites.update({
              where: { id: siteData.id },
              data: {
                ...siteData,
                updatedAt: new Date(),
                categories: undefined,
                tags: {
                  connectOrCreate: newTags.map((tag: string) => ({
                    where: {
                      siteID_tagID: { siteID: siteData.id, tagID: tag },
                    },
                    create: {
                      tag: {
                        connectOrCreate: {
                          where: { tag: tag },
                          create: { tag: tag },
                        },
                      },
                      assigner: { connect: { id: useAssigner } },
                    },
                  })),
                },
              },
            }),
          ]);
          return new Response(JSON.stringify({ data: { ...update[1] } }), {
            status: 200,
          });
        }
      } else if (useCategories) {
        let update = await prisma.$transaction([
          prisma.sites.update({
            where: { id: siteData.id },
            data: { categories: { set: [] } },
          }),
          prisma.sites.update({
            where: { id: siteData.id },
            data: {
              ...siteData,
              updatedAt: new Date(),
              categories: {
                connect: useCategories?.map((category) => ({
                  category: category,
                })),
              },
              tags: undefined,
            },
          }),
        ]);
        return new Response(JSON.stringify({ data: { ...update[1] } }), {
          status: 200,
        });
      } else {
        let update = await prisma.sites.update({
          where: { id: siteData.id },
          data: {
            ...siteData,
            updatedAt: new Date(),
            categories: undefined,
            tags: undefined,
          },
        });

        return new Response(JSON.stringify({ data: { ...update } }), {
          status: 200,
        });
      }
    } catch (err) {
      console.error("update error", err);
      return new Response(JSON.stringify({ ERROR: "" }), { status: 500 });
    }
  }
  return new Response(JSON.stringify({ ERROR: "" }), { status: 400 });
};
