import prisma from "../src/server/utils/prisma";

(async () => {
  const total = await prisma.sites.count(); 
  const update = await prisma.sites.updateMany({
    where: { allowEmbed: true },
    data: { status: "APPROVED" },
  });
  console.log("update?", update, "total?", total);
})();
