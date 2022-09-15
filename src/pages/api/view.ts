import type { APIRoute } from "astro";
import prisma from "../../server/utils/prisma";
export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  const { siteID, sessionID } = data;
  if (siteID && sessionID) {
    try {
      let session = await prisma.sessions.findFirst({where: {id: sessionID}});
      if(!session){
        return new Response(null, {status: 401})
      }
      let update = await prisma.sites.update({
        where: { id: siteID },
        data: { views: { increment: 1 } },
        select: { id: true, views: true },
      });
      return new Response(JSON.stringify({ data: { ...update } }), {
        status: 200,
      });
    } catch (err) {
      return new Response(JSON.stringify({ ERROR: "" }), { status: 500 });
    }
  }
  return new Response(JSON.stringify({ ERROR: "" }), { status: 401 });
}
