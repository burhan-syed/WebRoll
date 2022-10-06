import type { APIRoute } from "astro";
import { getWebRollSession } from "../../../server/utils/parseCookieString";
import prisma from "../../../server/utils/prisma";
const isProd = import.meta.env.PROD;

export const get: APIRoute = async function get({ request }) {
  const userIP =
    request.headers.get("x-forwarded-for") ?? !isProd ? "127.0.0.1" : null;
  const sessionID = getWebRollSession(request.headers.get("cookie"));

  if (!userIP || !sessionID) {
    return new Response(JSON.stringify({}), { status: 401 });
  }

  let params = new URLSearchParams(request.url?.split("?")?.[1]);
  const sites = JSON.parse(params?.get("sites") ?? "[]") as string[];
  if (!sites || !(sites.length > 0)) {
    return new Response(null, { status: 400 });
  }

  try {
    const sess = await prisma.sessions.findFirst({
      where: { id: sessionID },
    });
    if (!sess) {
      return new Response(JSON.stringify({}), { status: 401 });
    }
    const query = await prisma.sites.findMany({
      where: { id: { in: sites } },
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
    //console.log(sites, query);
    return new Response(JSON.stringify({ data: query }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
      status: 500,
    });
  }
};
