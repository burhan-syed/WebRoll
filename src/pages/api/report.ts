import type { APIRoute } from "astro";
import prisma from "../../server/utils/prisma";
export const post: APIRoute = async function post({ request }) {
  console.log(request.headers);
  const data = await request.json();
  const ip = "";
  const { siteID, sessionID, reportType } = data;
  if (!siteID || !sessionID || !reportType) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const sessData = await prisma.sessions.findFirst({
      where: { id: sessionID },
    });
    if (!sessData) {
      return new Response(null, { status: 401 });
    }
    const r = await prisma.reports.upsert({
      where: { siteId_sessionId: { siteId: siteID, sessionId: sessionID } },
      create: {
        type: reportType,
        ip: ip,
        siteId: siteID,
        sessionId: sessionID,
      },
      update: {
        type: reportType, 
        date: new Date(), 
        ip: ip,
      }
    });
    return new Response(null, { status: 200 });
  } catch (err) {
    console.log("like error", err);
    return new Response(null, { status: 500 });
  }
};
