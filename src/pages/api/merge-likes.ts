import { getUser } from "@astro-auth/core";
import { parseCookie } from "../../server/utils/parseCookieString";
import prisma from "../../server/utils/prisma";
import type { APIRoute } from "astro";
import type { JwtPayload } from "jsonwebtoken";
export const post: APIRoute = async function post({ request }) {
  const user = getUser({ server: request }) as JwtPayload;
  const cookies = parseCookie(request.headers.get("cookie") ?? "");
  const wrSessions = cookies?.["webroll_session"].split(".");
  if (wrSessions?.[0]?.length !== 48 || wrSessions?.[1]?.length !== 48) {
    return new Response("invalid request", { status: 400 });
  }

  try {
    const oldSessData = await prisma.sessions.findFirst({
      where: { id: wrSessions?.[1] },
      include: { account: true, likes: { where: { direction: true } } },
    });
    if (
      oldSessData?.account?.email &&
      oldSessData?.account?.email !== user?.email
    ) {
      return new Response(null, { status: 401 });
    }
    const update = await (oldSessData && oldSessData?.likes?.length > 0
      ? prisma.$transaction([
          ...oldSessData?.likes.map((like) =>
            prisma.likes.upsert({
              where: {
                siteId_sessionId: {
                  sessionId: wrSessions[0],
                  siteId: like.siteId,
                },
              },
              create: {
                date: like.date,
                sessionId: wrSessions[0],
                direction: like.direction,
                ip: like.ip,
                siteId: like.siteId,
              },
              update: { direction: like.direction },
            })
          ),
          prisma.likes.deleteMany({
            where: { id: { in: oldSessData.likes.map((l) => l.id) } },
          }),
        ])
      : "");
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `webroll_session=${wrSessions[0]}.; Secure; HttpOnly;`
    );
    return new Response(JSON.stringify(update), { status: 200, headers });
  } catch (err) {
    console.error("update likes error", err);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 500 });
};
