import type { APIRoute } from "astro";
import { getWebRollSession } from "../../server/utils/parseCookieString";
import prisma from "../../server/utils/prisma";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const isProd = import.meta.env.PROD

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5,"10 s")
})

export const get: APIRoute = async function get({ request }) {
  const userIP = request.headers.get("x-forwarded-for") ?? !isProd ? "127.0.0.1" : null; 
  const {success, pending, limit, reset, remaining} = await ratelimit.limit(`mw_${userIP}`);
  await pending; 
  if(!success){
    return new Response("Too many requests", {status: 429}); 
  }
  const sessionID = getWebRollSession(request.headers.get("cookie"));
  if (!userIP || !sessionID) {
    return new Response(JSON.stringify({}), { status: 401 });
  }
  try {
    const sess = await prisma.sessions.findFirst({
      where: { id: sessionID },
      orderBy: { expiresAt: "desc" },
      include: {categories: {select: {category: true}}}
    });
    if (!sess) {
      return new Response(JSON.stringify({}), { status: 401 });
    }
    const selected_categories = sess.categories.map(c => c.category);
    const categorySelect = selected_categories?.length > 0 ? {categories: {some: {category: {in: selected_categories}}}} : {};


    const allSitesCount = await prisma.sites.count({
      where: { status: "APPROVED", ...categorySelect },
    });
    const randOrderBys = ["description", "name", "imgKey", "url","id"];
    const randOrderBy = randOrderBys[Math.floor(Math.random()*randOrderBys.length)]
    const randSorts = ["asc", "desc"];
    const randSort = randSorts[Math.floor(Math.random()*randSorts.length)]
    const sites = await prisma.sites.findMany({
      where: { status: "APPROVED", ...categorySelect },
      take: 3,
      skip: Math.floor(Math.random() * allSitesCount),
      orderBy: {[randOrderBy]: randSort},
      select: {
        id: true,
        imgKey: true,
        url: true,
        name: true,
        description: true,
        allowEmbed: true,
        categories: { select: { category: true } },
        likes: { where: { sessionId: sessionID } },
        tags: {select: {tag: {select: {tag: true}}}}
      },
    });
    return new Response(JSON.stringify({ data: sites }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
      status: 500,
    });
  }
};
