import csv from "csvtojson";
import ObjectsToCsv from "objects-to-csv";
import parseMetadata from "../src/server/metaparser/parse";
import {
  extractUrl,
  parseTags,
  splitUrl,
} from "../src/server/metaparser/utils";

//import fetch from 'node-fetch-commonjs'
import axios from "axios";
import url from "url";
(async () => {
  const mapCategories = (category: string, my_category: string) => {
    let categories = [];

    const map = (v: string) => {
      if (!v) return "";
      const vUpper = v.toUpperCase();
      if (vUpper.includes("ART") || vUpper.includes("DESIGN")) {
        return "Arts & Design";
      }
      if (vUpper.includes("BOOKS") || vUpper.includes("LITERATURE")) {
        return "Books & Literature";
      }
      if (vUpper.includes("BUSINESS") || vUpper.includes("FINANCE")) {
        return "Business & Economics";
      }
      if (vUpper.includes("FOOD")) {
        return "Food & Cooking";
      }
      if (vUpper.includes("FUN")) {
        return "Fun";
      }
      if (vUpper.includes("GAMING") || vUpper.includes("GAME")) {
        return "Games";
      }
      if (vUpper.includes("HEALTH") || vUpper.includes("FITNESS")) {
        return "Health & Fitness";
      }
      if (vUpper.includes("HOBBIES") || vUpper.includes("LEISURE")) {
        return "Hobbies & Leisure";
      }
      if (vUpper.includes("HOME") || vUpper.includes("GARDEN")) {
        return "Home & Garden";
      }
      if (vUpper.includes("JOBS") || vUpper.includes("EDUCATION")) {
        return "Jobs & Education";
      }
      if (vUpper.includes("MUSIC") || vUpper.includes("AUDIO")) {
        return "Music & Audio";
      }
      if (vUpper.includes("NATURE") || vUpper.includes("ANIMALS")) {
        return "Nature & Animals";
      }
      if (vUpper.includes("OTHER")) {
        return "Other";
      }
      if (
        vUpper.includes("HISTORY") ||
        vUpper.includes("CULTURE") ||
        vUpper.includes("PEOPLE") ||
        vUpper.includes("SOCIETY")
      ) {
        return "People & Society";
      }
      if (vUpper.includes("PHILOSOPHY") || vUpper.includes("LIFE")) {
        return "Philosophy & Life";
      }
      if (vUpper.includes("SCIENCE") || vUpper.includes("MATH")) {
        return "Science & Math";
      }
      if (vUpper.includes("SPORTS")) {
        return "Sports";
      }
      if (vUpper.includes("TECHNOLOGY")) {
        return "Technology";
      }
      if (vUpper.includes("TV")) {
        return "TV, Movies, Videos";
      }
      return "?";
    };

    if (!my_category || !(my_category.length > 0)) {
      categories.push(map(category));
    } else {
      let catgs = my_category?.split(";") ?? [""];
      catgs.forEach((c) => {
        categories.push(map(c));
      });
    }
    return categories;
  };

  const parseRow = async (row: {
    url: string;
    skip: undefined | string;
    category: string;
    my_category: string;
    tags: undefined | string;
    exceptional: undefined | string;
    source: undefined | string;
  }) => {
    if (!row || !row.url || row.skip) return;
    const baseUrl = extractUrl(row.url);
    const response = await axios.get(baseUrl); //await fetch(baseUrl);
    const resURL = `https://${url.parse(response.config.url ?? "")?.host}`;
    //const resURL = splitUrl(response.url)?.host ?? baseUrl;
    //const xFrameOptions = response.headers?.get("X-Frame-Options");
    const xFrameOptions = response.headers?.["x-frame-options"];

    const allowEmbed = !(
      xFrameOptions === "DENY" ||
      xFrameOptions === "SAMEORIGIN" ||
      xFrameOptions === "ALLOW-FROM"
    );
    const { description, title, keywords } = await parseMetadata(response.data);
    if (keywords) {
      console.log("KEYWORDS>>", keywords);
    }

    const tags = [
      ...(row.tags?.split(";") ?? [""]),
      ...(keywords ? keywords.split(",") : [""]),
    ].filter((t) => t.length > 0);
    //console.log("tags?", tags);
    const { cleanedTags, invalidTags } =
      tags.length > 0
        ? parseTags(tags)
        : (() => ({ cleanedTags: [], invalidTags: [] }))();
    const categories = mapCategories(row.category, row.my_category);

    return {
      name: title,
      url: resURL,
      categories: categories,
      tags: cleanedTags,
      description: description,
      allowEmbed,
      sourceLink: row?.source ?? "",
    };
  };

  const FILE_PATH = "./scripts/site_mapping.csv";
  const jsonArray = await csv().fromFile(FILE_PATH);
  // .subscribe((json) => {
  //   return new Promise(async(resolve, reject) => {
  //     //console.log("line?", json);
  //     try{
  //       const parsed = await parseRow(json);
  //       parsed && parsedRows.push(parsed);
  //       resolve();
  //     }catch(err){
  //       console.log("parse error", err);
  //       reject();
  //     }
  //   });
  // });
  console.log("final json array", jsonArray.length);

  (async () => {
    const parsedRows = [] as any;
    const failedRows = [] as any;
    //test
    // const row = {
    //   url: "troddit.com",
    //   category: "technology",
    //   tags: "one;two;three;fuck",
    //   skip:"", my_category:"", exceptional:"", source:""
    // };
    // try {
    //   console.log("parse..", row?.url);
    //   const parsed = await parseRow(row);
    //   console.log(":",parsed)
    //   parsed && parsedRows.push(parsed);
    // } catch (err) {
    //   console.log("parse error", err);
    // }

    //buffer these requests 20 at a time
    const groupElements = (elements: any[], elementsPerGroup = 20) => {
      let groups = new Array(
        Math.ceil(elements.length / elementsPerGroup)
      ).fill([]);
      groups = groups.map((g, i) => [
        ...elements.slice(i * elementsPerGroup, (i + 1) * elementsPerGroup),
      ]);
      return groups;
    };

    const groups = groupElements(jsonArray);

    for (let i = 0; i < groups.length; i++) {
      await Promise.all(
        groups[i].map(async (row: any) => {
          try {
            console.log("parse..", row?.url);
            const parsed = await parseRow(row);
            parsed && parsedRows.push(parsed);
          } catch (err) {
            failedRows.push(row);
            console.log("parse error", row?.url);
          }
        })
      );
    }

    const csv = new ObjectsToCsv(parsedRows);
    const failCSV = new ObjectsToCsv(failedRows);
    // Save to file:
    await csv.toDisk("./parsedRows.csv");
    await failCSV.toDisk("./failedParseRows.csv");
    // Return the CSV file as string:
    console.log(await failedRows.toString());
  })();
})();
