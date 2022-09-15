import type { APIRoute } from "astro";
import prisma from "../../server/utils/prisma";
export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  const { siteID, sessionID, direction, ip } = data;
  if (!siteID || !sessionID || !ip || (direction !== false && direction !== true)) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const sessData = await prisma.sessions.findFirst({
      where: { id: sessionID },
    });
    if (!sessData) {
      return new Response(null, { status: 401 });
    }
    const update = await prisma.likes.upsert({
      where: { siteId_sessionId: { siteId: siteID, sessionId: sessionID } },
      create: {
        ip,
        direction,
        user: { connect: { id: sessionID } },
        site: { connect: { id: siteID } },
      },
      update: { direction, ip },
    });
    console.log("like:", update); 
    return new Response(null, { status: 200 });
  } catch (err) {
    console.log("like error", err);
    return new Response(null, { status: 500 });
  }
};
