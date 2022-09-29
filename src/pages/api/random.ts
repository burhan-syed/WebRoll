import type { APIRoute } from "astro";
import { getWebRollSession } from "../../server/utils/parseCookieString";
import prisma from "../../server/utils/prisma";

const isProd = import.meta.env.PROD

export const post: APIRoute = async function post({ request }) {
  console.log(request);
  const sessionID = getWebRollSession(request.headers.get("cookie"));
  const data = await request.json();
  const userIP = request.headers.get("x-forwarded-for") ?? !isProd ? "127.0.0.1" : null; 
  if (!userIP || !sessionID) {
    return new Response(JSON.stringify({}), { status: 401 });
  }
  try {
    const sess = await prisma.sessions.findFirst({
      where: { id: sessionID },
      orderBy: { expiresAt: "desc" },
    });
    if (!sess) {
      return new Response(JSON.stringify({}), { status: 401 });
    }

    const allSitesCount = await prisma.sites.count({
      where: { status: "APPROVED" },
    });
    const sites = await prisma.sites.findMany({
      where: { status: "APPROVED" },
      take: 3,
      skip: Math.floor(Math.random() * allSitesCount),
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
    return new Response(JSON.stringify({ data: sites }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
      status: 500,
    });
  }
};
