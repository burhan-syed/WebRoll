import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const sessionCounts = await prisma.sessions.deleteMany({
    where: {
      categories: {none: {category: {not: undefined}}},
      likes: {none: {id: {not: undefined}}},
      reports: {none: {id: {not: undefined}}},
      sites: {none: {id: {not: undefined}}},
      tags: {none: {tagID: {not: undefined}}},
      account: {isNot: {email: {not: undefined}}}
    },
    // select: {
    //   id: true,
    //   _count: {
    //     select: {
    //       categories: true,
    //       likes: true,
    //       reports: true,
    //       sites: true,
    //       tags: true,
    //     },
    //   },
    // },
  });
  console.log(sessionCounts);
})();
