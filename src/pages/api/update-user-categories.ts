import type { APIRoute } from "astro";
import { getWebRollSession } from "../../server/utils/parseCookieString";
import prisma from "../../server/utils/prisma";
const isProd = import.meta.env.PROD;
export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  const sessionID = getWebRollSession(request.headers.get("cookie"));
  const ip =
    request.headers.get("x-forwarded-for") ?? !isProd ? "127.0.0.1" : null;
  const { categories } = data as { categories: (string | null)[] };
  if (!sessionID || !ip) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const update = await prisma.$transaction([
      prisma.sessions.update({
        where: { id: sessionID },
        data: { categories: { set: [] } },
      }),
      prisma.sessions.update({
        where: { id: sessionID },
        data: {
          categories: {
            connect: (categories.filter((c) => c) as string[]).map((c) => ({
              category: c,
            })),
          },
        },
        select: {
          categories: { select: { category: true } },
        },
      }),
    ]);

    return new Response(JSON.stringify({ data: update?.[1]?.categories }), {
      status: 200,
    });
  } catch (err) {
    console.error("user catgs error", err);
    return new Response(null, { status: 500 });
  }
};
