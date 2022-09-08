import prisma from "../../server/utils/prisma";
export async function post({ request }: any) {
  const data = await request.json();
  const { siteID } = data;
  if (siteID) {
    try {
      let update = await prisma.site.update({
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
