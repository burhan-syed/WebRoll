import { getUser } from "@astro-auth/core";
import prisma from "../../../server/utils/prisma";
import type { APIRoute } from "astro";
import type { User } from "../../../types";
import { diffTags } from "../../../server/utils/db";

export const post: APIRoute = async function post({ request }) {
  const user = getUser({ server: request }) as User;
  if (user?.role !== "ADMIN") {
    return new Response(null, { status: 401 });
  }
  const { reportID } = await request.json();
  if (!reportID) {
    return new Response("missing report id", { status: 400 });
  }
  try {
    const report = await prisma.reports.findFirst({
      where: { id: reportID },
      include: {
        categories: { select: { category: true } },
        tags: { select: { tag: true } },
      },
    });
    if (report?.type === "CATEGORY" && report.categories.length > 0) {
      let update = await prisma.$transaction([
        prisma.sites.update({
          where: { id: report.siteId },
          data: { categories: { set: [] } },
        }),
        prisma.sites.update({
          where: { id: report.siteId },
          data: {
            categories: {
              connect: report.categories.map((c) => ({ category: c.category })),
            },
          },
        }),
      ]);
      return new Response(JSON.stringify({ data: update[1] }), { status: 200 });
    } else if (report?.type === "TAGS" && report.tags.length > 0) {
      const { removedTags, newTags } = await diffTags({
        siteID: report.siteId,
        tags: report.tags.map((t) => t.tag),
      });
      let update = await prisma.$transaction([
        prisma.siteTags.deleteMany({
          where: { siteID: report.siteId, tagID: { in: removedTags } },
        }),
        prisma.sites.update({
          where: { id: report.siteId },
          data: {
            updatedAt: new Date(),
            tags: {
              connectOrCreate: newTags.map((tag: string) => ({
                where: {
                  siteID_tagID: { siteID: report.siteId, tagID: tag },
                },
                create: {
                  tag: {
                    connectOrCreate: {
                      where: { tag: tag },
                      create: { tag: tag },
                    },
                  },
                  assigner: { connect: { id: report.sessionId } },
                },
              })),
            },
          },
        }),
      ]);
      return new Response(JSON.stringify({ data: update[1] }), { status: 200 });
    }
    return new Response("invalid report type", { status: 400 });
  } catch {
    return new Response(null, { status: 500 });
  }
};
