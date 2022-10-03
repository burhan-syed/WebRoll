import { PrismaClient } from "@prisma/client";
import csv from "csvtojson";

const ADMIN_ID = "";

const getRandomValues = require("get-random-values");

let nanoid = (size = 21) => {
  let id = "";
  let bytes = getRandomValues(new Uint8Array(size));
  while (size--) {
    let byte = bytes[size] & 63;
    if (byte < 36) {
      // `0-9a-z`
      id += byte.toString(36);
    } else if (byte < 62) {
      // `A-Z`
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte < 63) {
      id += "_";
    } else {
      id += "-";
    }
  }
  return id;
};

(async () => {
  let prisma = new PrismaClient();
  const FILE_PATH = "./scripts/parsedRows.csv";
  const jsonArray = await csv().fromFile(FILE_PATH);

  const formatted = jsonArray.map(
    (row: {
      name: string;
      url: string;
      categories: string;
      imgKey: string;
      tags: string;
      description: string;
      allowEmbed: boolean;
      sourceLink: string;
    }) => {
      const siteID = nanoid(7);
      const tags = (JSON.parse(row.tags) as string[]).slice(0, 20);
      const categories = JSON.parse(row.categories);
      const url = (() => {
        let rURL = row.url;
        if (rURL.includes("https://")) {
          return rURL;
        }
        if (rURL.includes("http://")) {
          return rURL.replace("http://", "https://");
        }
        return `https://${rURL}`;
      })();

      // if(tags.length > 19){
      //   console.log("tags?", tags);
      // }
      return {
        id: siteID,
        name: row?.name ?? url.replace("https://", ""),
        url: url,
        sourceLink: row?.sourceLink,
        description: row?.description,
        imgKey: row?.imgKey,
        allowEmbed: row?.allowEmbed ? true : false,
        submitterIP: "0.0.0.0",
        submitterID: ADMIN_ID,
        categories: {
          connect: [...categories.map((c: string) => ({ category: c }))],
        },
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { siteID_tagID: { siteID: siteID, tagID: tag } },
            create: {
              tag: {
                connectOrCreate: {
                  where: { tag: tag },
                  create: { tag: tag },
                },
              },
              assigner: { connect: { id: ADMIN_ID } },
            },
          })),
        },
      };
    }
  );
  console.log("Formatted?", formatted.length);

  // const remove = await prisma.$transaction([
  //   ...formatted.map((row) =>
  //     prisma.reports.deleteMany({ where: { site: { url: row.url } } })
  //   ),
  //   ...formatted.map((row) =>
  //     prisma.siteTags.deleteMany({ where: { site: { url: row.url } } })
  //   ),
  //   ...formatted.map((row) =>
  //     prisma.sites.deleteMany({ where: { url: row.url } })
  //   ),
  // ]);
  // console.log("remove?", remove.length);

  const create = await prisma.$transaction(
    formatted.map((row) =>
      prisma.sites.upsert({
        where: { url: row.url },
        create: { ...row },
        update: {},
      })
    )
  );

  console.log("created", create);
})();
