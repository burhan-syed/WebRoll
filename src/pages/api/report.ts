import type { ReportType } from "@prisma/client";
import type { APIRoute } from "astro";
import { getWebRollSession } from "../../server/utils/parseCookieString";
import { parseTags } from "../../server/metaparser/utils";
import prisma from "../../server/utils/prisma";
const isProd = import.meta.env.PROD;
export const post: APIRoute = async function post({ request }) {
  const sessionID = getWebRollSession(request.headers.get("cookie"));
  const data = await request.json();
  const ip =
    request.headers.get("x-forwarded-for") ?? !isProd ? "127.0.0.1" : null;
  const { siteID, reportType, categories, tags } = data as {
    siteID: string;
    reportType: ReportType;
    categories?: string[];
    tags?: { name: string }[];
  };
  if (!siteID || !sessionID || !reportType || !ip) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const sessData = await prisma.sessions.findFirst({
      where: { id: sessionID },
    });
    if (!sessData) {
      return new Response(null, { status: 401 });
    }
    let cCatgs = categories?.filter((c) => c);
    let { cleanedTags } = parseTags(tags?.map((t) => t.name));
    //console.log("catgs?", cCatgs, "tags?", cleanedTags);

    const r = await prisma.reports.upsert({
      where: {
        siteId_sessionId_type: {
          siteId: siteID,
          sessionId: sessData.id,
          type: reportType,
        },
      },
      create: {
        type: reportType,
        ip: ip,
        siteId: siteID,
        sessionId: sessionID,
        categories: { connect: cCatgs?.map((c) => ({ category: c })) },
        tags: {
          connectOrCreate: cleanedTags?.map((t) => ({
            where: { tag: t },
            create: { tag: t },
          })),
        },
      },
      update: {
        type: reportType,
        date: new Date(),
        ip: ip,
        categories: { connect: cCatgs?.map((c) => ({ category: c })) },
        tags: {
          connectOrCreate: cleanedTags?.map((t) => ({
            where: { tag: t },
            create: { tag: t },
          })),
        },
      },
    });
    //console.log("report?", r);
    return new Response(JSON.stringify({ data: r }), { status: 200 });
  } catch (err) {
    console.error("reports error", err);
    return new Response(null, { status: 500 });
  }
};
