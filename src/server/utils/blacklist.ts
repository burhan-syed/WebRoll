import fs, { createWriteStream } from "fs";
import fsPromises from "fs/promises";
import { pipeline } from "stream";
import { promisify } from "util";

const BLACKLIST_SOURCE = import.meta.env.BLACKLIST_SOURCE;
const BLACKLIST_PATH = "./blacklist.txt";

const downloadFile = async (url: string, path: string) => {
  const streamPipeline = promisify(pipeline);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error("unable to fetch file");
  }
  await streamPipeline(res.body as any, createWriteStream(path));
};

const getBlacklist = async () => {
  if (fs.existsSync(BLACKLIST_PATH)) {
  } else {
    await downloadFile(BLACKLIST_SOURCE, BLACKLIST_PATH);
  }
};

export const checkInBlacklist = async (url: string) => {
  const urlToCheck = url.replace("https://","").replace("https://",""); 
  try {
    await getBlacklist();
    const contents = await fsPromises.readFile(BLACKLIST_PATH, "utf-8");
    const contains = contents.includes(urlToCheck);
    return contains;
  } catch (err) {
    console.error("READ FILE ERROR", err);
    return true;
  }
};
