import prisma from "../../server/utils/prisma";
export async function post({ request }: any) {
  const data = await request.json();
  const { userIP, session } = data;
  if (!userIP || !session) {
    return new Response(JSON.stringify({}), { status: 401 });
  }
  try {
    const sess = await prisma.sessions.findMany({
      where: { ip: userIP, id: session },
      orderBy: { expiresAt: "desc" },
    });
    if (!(sess.length > 0)) {
      return new Response(JSON.stringify({}), { status: 401 });
    }

    const allSitesCount = await prisma.site.count({
      where: { status: "APPROVED" },
    });
    const sites = await prisma.site.findMany({
      where: { status: "APPROVED" },
      take: 3,
      skip: Math.floor(Math.random() * allSitesCount),
      select: {
        id: true,
        url: true,
        name: true,
        description: true,
        status: true,
        imgKey: true,
        allowEmbed: true,
        sourceLink: true,
        categories: { select: { category: true, description: true } },
        tags: { select: { tag: true } },
      },
    });
    return new Response(JSON.stringify({ data: sites }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ERROR: "Something went wrong" }), {
      status: 500,
    });
  }
}
