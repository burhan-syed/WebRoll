import csv from "csvtojson";
import {
  PrismaClient,
  ReportType,
  SessionRole,
  SiteStatus,
  TagStatus,
} from "@prisma/client";
import type {
  Accounts,
  AccountStatus,
  AccountVerifications,
  VerifType,
} from "@prisma/client";
const prisma = new PrismaClient();

const stringToDate = (seconds: string) => {
  return new Date(parseInt(seconds));
};

const stringToBoolean = (str: string) => {
  return str === "1" ? true : false;
};

const nullCheck = (value: any) =>
  value === undefined || value === null || value === "";

(async () => {
  const importAccounts = async (FILE_PATH: string) => {
    console.log("importing accounts..");
    const data = (await csv().fromFile(FILE_PATH)) as Accounts[];
    if (!data?.[0]?.email || !data?.[0]?.password || !data?.[0]?.status) {
      throw new Error(`invalid account data ${data?.[0]}`);
    }
    console.log(`writing ${data.length} accounts`);
    const create = await prisma.accounts.createMany({
      data: data,
      skipDuplicates: true,
    });
    console.log(`wrote ${create.count} accounts`);
  };

  const importAccountVerifications = async (FILE_PATH: string) => {
    console.log("importing account verifications..");

    const data = (await csv().fromFile(FILE_PATH)) as {
      id: string;
      createdAt: string;
      expiresAt: string;
      verificationType: VerifType;
      accountID: string;
    }[];
    if (
      !data?.[0]?.id ||
      !data?.[0]?.createdAt ||
      !data?.[0]?.expiresAt ||
      !data?.[0]?.verificationType
    ) {
      throw new Error(`invalid verification data ${data?.[0]}`);
    }
    const formatted = data.map((row) => ({
      ...row,
      createdAt: stringToDate(row.createdAt),
      expiresAt: stringToDate(row.expiresAt),
    }));
    console.log(`writing ${formatted.length} account verifications`);

    const create = await prisma.accountVerifications.createMany({
      data: formatted,
      skipDuplicates: true,
    });
    console.log(`wrote ${create.count} account verifications`);
  };

  const importSessions = async (FILE_PATH: string) => {
    console.log("importing sessions...");
    const data = (await csv().fromFile(FILE_PATH)) as {
      id: string;
      createdAt: string;
      lastAccessed: string;
      expiresAt: string;
      ip: string;
      role: SessionRole;
      accountID?: string;
      categories?: string;
    }[];
    if (
      !data?.[0]?.id ||
      !data?.[0]?.createdAt ||
      !data?.[0]?.lastAccessed ||
      !data?.[0]?.expiresAt ||
      !data?.[0]?.ip ||
      !data?.[0]?.role
    ) {
      throw new Error(`invalid session data ${data?.[0]}`);
    }
    console.log(`writing ${data.length} sessions`);
    const create = await prisma.$transaction(
      data.map((row) => {
        const parsedCategories = JSON.parse(row.categories ?? "") as {
          category: string;
        }[];

        return prisma.sessions.create({
          data: {
            id: row.id,
            createdAt: stringToDate(row.createdAt),
            lastAccessed: stringToDate(row.lastAccessed),
            expiresAt: stringToDate(row.expiresAt),
            ip: row.ip,
            role: row.role,
            categories: {
              connect:
                parsedCategories && parsedCategories?.length > 0
                  ? parsedCategories
                  : undefined,
            },
            accountID: row.accountID ? row.accountID : null,
          },
        });
      })
    );
    console.log(`wrote ${create.length} sessions`);
  };

  const importCategories = async (FILE_PATH: string) => {
    console.log("importing categories...");

    const data = (await csv().fromFile(FILE_PATH)) as {
      category: string;
      createdAt: string;
    }[];
    if (!data?.[0]?.category || !data?.[0]?.createdAt) {
      throw new Error(`invalid category data ${data?.[0]}`);
    }
    const formatted = data.map((row) => ({
      ...row,
      createdAt: stringToDate(row.createdAt),
    }));
    console.log(`writing ${formatted.length} categories...`);
    const create = await prisma.categories.createMany({ data: formatted });
    console.log(`wrote  ${create.count} categories...`);
  };
  const importTags = async (FILE_PATH: string) => {
    console.log(`importing tags...`);

    const data = (await csv().fromFile(FILE_PATH)) as {
      tag: string;
      createdAt: string;
    }[];
    if (!data?.[0]?.tag || !data?.[0]?.createdAt) {
      throw new Error(`invalid tag data ${data?.[0]}`);
    }
    const formatted = data.map((row) => ({
      ...row,
      createdAt: stringToDate(row.createdAt),
    }));
    console.log(`writing ${formatted.length} tags...`);

    const create = await prisma.tags.createMany({
      data: formatted,
      skipDuplicates: true,
    });
    console.log(`wrote ${create.count} tags...`);
  };

  const importSites = async (FILE_PATH: string) => {
    console.log(`importing sites...`);

    const data = (await csv().fromFile(FILE_PATH)) as {
      id: string;
      name: string;
      url: string;
      sourceLink?: string;
      views: string;
      dislikes: string;
      reports: string;
      description?: string;
      allowEmbed: string;
      privacy: string;
      adult: string;
      status: SiteStatus;
      submitterIP: string;
      submitterID: string;
      submittedAt: string;
      updatedAt: string;
      imgKey?: string;
      categories: string;
    }[];
    if (
      nullCheck(data?.[0]?.id) ||
      nullCheck(data?.[0]?.name) ||
      nullCheck(data?.[0]?.url) ||
      nullCheck(data?.[0]?.views) ||
      nullCheck(data?.[0]?.dislikes) ||
      nullCheck(data?.[0]?.reports) ||
      nullCheck(data?.[0]?.allowEmbed) ||
      nullCheck(data?.[0]?.status) ||
      nullCheck(data?.[0]?.submitterIP) ||
      nullCheck(data?.[0]?.submittedAt) ||
      nullCheck(data?.[0]?.updatedAt) ||
      nullCheck(data?.[0]?.categories?.[0])
    ) {
      throw new Error(
        `invalid site data ${JSON.stringify(data?.[0], null, 4)}`
      );
    }
    console.log("writing ", data.length, " sites");
    const c2 = await prisma.$transaction(
      data.map((row) => {
        const parsedCategories = JSON.parse(row.categories ?? "") as {
          category: string;
        }[];
        return prisma.sites.create({
          data: {
            ///...row,
            id: row.id,
            name: row.name,
            url: row.url,
            sourceLink: row.sourceLink,
            views: parseInt(row.views),
            dislikes: parseInt(row.dislikes),
            reports: parseInt(row.reports),
            description: row.description,
            allowEmbed: stringToBoolean(row.allowEmbed),
            privacy: stringToBoolean(row.privacy),
            adult: stringToBoolean(row.adult),
            status: row.status,
            submitterIP: row.submitterIP,
            submittedAt: stringToDate(row.submittedAt),
            updatedAt: stringToDate(row.updatedAt),
            imgKey: row.imgKey,
            submitter: {
              connect: {
                id: row.submitterID,
              },
            },
            categories: {
              connect:
                parsedCategories && parsedCategories?.length > 0
                  ? parsedCategories
                  : undefined,
            },
          },
        });
      })
    );

    console.log(`wrote ${c2.length} sites...`);
  };
  const importSiteTags = async (FILE_PATH: string) => {
    console.log(`importing site tags...`);

    const data = (await csv().fromFile(FILE_PATH)) as {
      siteID: string;
      tagID: string;
      assignedAt: string;
      assignedBy: string;
      status: TagStatus;
    }[];
    if (
      nullCheck(data?.[0]?.siteID) ||
      nullCheck(data?.[0]?.tagID) ||
      nullCheck(data?.[0]?.assignedAt) ||
      nullCheck(data?.[0]?.assignedBy) ||
      nullCheck(data?.[0]?.status)
    ) {
      throw new Error(
        `invalid sitetag data ${JSON.stringify(data?.[0], null, 4)}`
      );
    }
    const formatted = data.map((row) => ({
      ...row,
      assignedAt: stringToDate(row.assignedAt),
    }));
    console.log(`writing ${formatted.length} site tags...`);
    const create = await prisma.siteTags.createMany({
      data: formatted,
      skipDuplicates: true,
    });
    console.log(`wrote ${create.count} site tags...`);
  };

  const importLikes = async (FILE_PATH: string) => {
    console.log("importing likes..");
    const data = (await csv().fromFile(FILE_PATH)) as {
      id: string;
      siteId: string;
      ip: string;
      sessionId: string;
      date: string;
      direction: string;
    }[];
    if (
      nullCheck(data?.[0]?.id) ||
      nullCheck(data?.[0]?.siteId) ||
      nullCheck(data?.[0]?.ip) ||
      nullCheck(data?.[0]?.sessionId) ||
      nullCheck(data?.[0]?.date) ||
      nullCheck(data?.[0]?.direction)
    ) {
      throw new Error(
        `invalid likes data ${JSON.stringify(data?.[0], null, 4)}`
      );
    }
    const formatted = data.map((row) => ({
      ...row,
      id: parseInt(row.id),
      date: stringToDate(row.date),
      direction: stringToBoolean(row.direction),
    }));
    console.log(`writing ${formatted.length} likes...`);
    const create = await prisma.likes.createMany({
      data: formatted,
      skipDuplicates: true,
    });

    console.log(`wrote ${create.count} likes...`);
  };

  const importReports = async (FILE_PATH: string) => {
    console.log("importing reports...");
    const data = (await csv().fromFile(FILE_PATH)) as {
      id: string;
      siteId: string;
      ip: string;
      sessionId: string;
      date: string;
      resolved: string;
      type: ReportType;
      categories: string;
      tags: string;
    }[];
    if (
      nullCheck(data?.[0]?.id) ||
      nullCheck(data?.[0]?.siteId) ||
      nullCheck(data?.[0]?.ip) ||
      nullCheck(data?.[0]?.sessionId) ||
      nullCheck(data?.[0]?.date) ||
      nullCheck(data?.[0]?.resolved) ||
      nullCheck(data?.[0].type)
    ) {
      throw new Error(
        `invalid reports data ${JSON.stringify(data?.[0], null, 4)}`
      );
    }
    const create = await prisma.$transaction(
      data.map((row) => {
        const parsedCategories = JSON.parse(row.categories ?? "") as {
          category: string;
        }[];
        const parsedTags = JSON.parse(row.tags ?? "") as { tag: string }[];
        return prisma.reports.create({
          data: {
            ...row,
            id: parseInt(row.id),
            date: stringToDate(row.date),
            resolved: stringToBoolean(row.resolved),
            categories: {
              connect:
                parsedCategories && parsedCategories?.length > 0
                  ? parsedCategories
                  : undefined,
            },
            tags: {
              connect:
                parsedTags && parsedTags?.length > 0 ? parsedTags : undefined,
            },
          },
        });
      })
    );
    console.log(`wrote ${create.length} reports...`);
  };

  // await importAccounts(
  //   "scripts/backup/data/accounts_2022-12-07T19:20:34.337Z.csv"
  // );
  // await importAccountVerifications(
  //   "scripts/backup/data/accountVerifications_2022-12-07T19:20:35.237Z.csv"
  // );
  // await importCategories(
  //   "scripts/backup/data/categories_2022-12-07T19:20:35.703Z.csv"
  // );
  // await importTags("scripts/backup/data/tags_2022-12-07T19:20:36.235Z.csv");
  // await importSessions(
  //   "scripts/backup/data/sessions_2022-12-07T19:20:37.244Z.csv"
  // );
  // await importSites("scripts/backup/data/sites_2022-12-07T19:20:35.848Z.csv");
  // await importSiteTags(
  //   "scripts/backup/data/sitetags_2022-12-07T19:20:36.020Z.csv"
  // );
  // await importLikes("scripts/backup/data/likes_2022-12-07T19:20:37.008Z.csv");
  // await importReports(
  //   "scripts/backup/data/reports_2022-12-07T19:20:36.540Z.csv"
  // );
})();
