import he from "he";
import chrome from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import { putImageObject } from "../aws/bucket";
const decode = (str: string) => {
  const text = he.decode(str);
  return text;
};
const fetchMetadata = async (url: string) => {
  const options = import.meta.env.AWS_REGION
    ? {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
      }
    : {
        args: [],
        executablePath:
          process.platform === "win32"
            ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
            : process.platform === "linux"
            ? "/usr/bin/google-chrome"
            : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      };

  console.log("fetch..", url, "options:", options);
  let metadata = {} as any;

  const checkMetas = (html: string) => {
    const head = decode(html.split("</head>")[0]);
    const metas = head.split("<meta ");
    metas.forEach((meta, i) => {
      if (i === 0) return;
      //console.log("meta", meta);
      // if (meta.includes("name=") && meta.includes("content=")) {
      //   const name = meta.split("name=")?.[1]?.split(`"`);
      //   //console.log("name:", name);
      //   const content = meta.split("content=")?.[1]?.split(`"`);
      //   //console.log("content:", content);
      // }
      meta.replace(
        /(property|name)="(.*?)".+content="(.*?)".*\/>/gim,
        (match: any, p0: any, p1: any, p2: any) => {
          //console.log("replace", match, "P0", p0, "P1", p1, "P2", p2);
          metadata[p1] = p2;
          return "";
        }
      );
    });
    const siteTitle = head?.split("<title>")?.[1]?.split("</title>")?.[0];
    metadata["title"] = siteTitle;
  };
  const uploadImage = async (url: string, screen: string | Buffer) => {
    try {
      const imgKey = await putImageObject({ image: screen, siteURL: url });
      //metadata["ETAG"] = data.ETag;
      metadata["imgKey"] = imgKey;
      // metadata["imgLocation"] = data.Location;
    } catch (err) {
      console.log("couldn't upload image", err);
    }
  };

  try {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0"
    );
    await page.setViewport({ width: 1920, height: 1080 });
    let res = await page.goto(url, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      // path: `./images/${
      //   url.replace("https://", "").split(".")?.[url.split(".").length - 2] ??
      //   (Math.random() * 1000).toFixed(0).toString()
      // }.png`,
      type: "webp",
    });

    //browser.close();

    if (!res) {
      throw new Error("Unable to fetch page");
    }
    const resURL = res.request().redirectChain()?.[0]?.url() ?? url;
    metadata["resURL"] = resURL;
    await uploadImage(resURL, screenshot);
    const html = await res.text();
    checkMetas(html);
  } catch (err) {
    console.log("FALLBACK", err);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "request",
      },
    });
    metadata["resURL"] = res.url;
    const html = await res.text();
    checkMetas(html);
  }

  return metadata;
};

export default fetchMetadata;
