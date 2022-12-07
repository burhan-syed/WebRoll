import ObjectsToCsv from "objects-to-csv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
(async () => {
  const exportData = async (data: any[], title: string) => {
    console.log(`writing ${title} (${data.length})...`);
    const csv = new ObjectsToCsv(data);
    const now = new Date().toISOString();
    await csv.toDisk(`./scripts/backup/data/${title}_${now}.csv`);
    console.log(`wrote ${title}`);
  };

  const getSites = async () => {
    const sites = await prisma.sites.findMany({
      include: {
        categories: { select: { category: true } },
        submitter: { select: { id: true } },
      },
    });
    await exportData(sites, "sites");
  };

  const getLikes = async () => {
    const likes = await prisma.likes.findMany();
    await exportData(likes, "likes");
  };

  const getReports = async () => {
    const reports = await prisma.reports.findMany({
      include: {
        categories: { select: { category: true } },
        tags: { select: { tag: true } },
      },
    });
    await exportData(reports, "reports");
  };

  const getTags = async () => {
    const tags = await prisma.tags.findMany();
    await exportData(tags, "tags");
  };

  const getSiteTags = async () => {
    const sitetags = await prisma.siteTags.findMany();
    await exportData(sitetags, "sitetags");
  };

  const getCategories = async () => {
    const categories = await prisma.categories.findMany();
    await exportData(categories, "categories");
  };

  const getSessions = async () => {
    const sessions = await prisma.sessions.findMany({
      include: { categories: { select: { category: true } } },
    });
    await exportData(sessions, "sessions");
  };

  const getAccounts = async () => {
    const accounts = await prisma.accounts.findMany();
    await exportData(accounts, "accounts");
  };

  const getAccountVerifications = async () => {
    const accountVerifications = await prisma.accountVerifications.findMany();
    await exportData(accountVerifications, "accountVerifications");
  };

  await Promise.all([
    getSites(),
    getLikes(),
    getReports(),
    getTags(),
    getCategories(),
    getSessions(),
    getAccounts(),
    getAccountVerifications(),
    getSiteTags(),
  ]);
})();
