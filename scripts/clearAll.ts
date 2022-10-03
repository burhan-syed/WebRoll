import prisma from "../src/server/utils/prisma";

(async () => {
  const deleteAll = await prisma.$transaction([
    prisma.reports.deleteMany(),
    prisma.siteTags.deleteMany(),
    prisma.tags.deleteMany(),
    prisma.likes.deleteMany(),
    prisma.accountVerifications.deleteMany(), 
    prisma.accounts.deleteMany(), 
    prisma.sessions.deleteMany(), 
    prisma.sites.deleteMany(),
    prisma.categories.deleteMany(),
  ]);
  console.log("delete?", deleteAll)
})();
