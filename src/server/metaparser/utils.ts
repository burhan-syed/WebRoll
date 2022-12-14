import urlparse from "url";

function makeUrlAbsolute(base: string, relative: string): string {
  const relativeParsed = urlparse.parse(relative);

  if (relativeParsed.host === null) {
    return urlparse.resolve(base, relative);
  }

  return relative;
}

function makeUrlSecure(url: string): string {
  return url.replace(/^http:/, "https:");
}

function parseUrl(url: string): string {
  return urlparse.parse(url).hostname || "";
}
function getProvider(host: string): string {
  return host
    .replace(/www[a-zA-Z0-9]*\./, "")
    .replace(".co.", ".")
    .split(".")
    .slice(0, -1)
    .join(" ");
}

export const extractUrl = (url: string) => {
  let urlCopy = url;
  if (urlCopy.includes("http")) {
    urlCopy = makeUrlSecure(url);
  } else {
    urlCopy = `https://${urlCopy}`;
  }
  let pathArray = urlCopy.split("/");
  let protocol = pathArray[0];
  let host = pathArray[2];
  return `${protocol}//${host}`;
};
export const splitUrl = (url:string) => {
  let pathArray = url.split("/"); 
  let protocol = pathArray[0];
  let host = pathArray[2];
  let path = pathArray?.length > 3 ? pathArray.slice(2,-1)?.join("/") : "";
  return {host: `${protocol}//${host}`, path: path}
}

import Filter from "bad-words";

const checkTag = (tag: string) => {
  let filter = new Filter({});

  let checkedTag = filter
    .clean(tag)
    ?.replace(/\*/g, "")
    ?.trim()
    ?.toUpperCase();
  if (
    checkedTag.match(/[A-Z ]/)?.[0]?.length === checkTag.length &&
    checkedTag.length <= 48 &&
    checkedTag?.replace(/ /g, "").length >= 2
  ) {
    return checkedTag;
  }
  return "";
};

export const parseTags = (tags: string[] | undefined) => {
  let cleanedTags = [] as string[];
  let invalidTags = [] as string[];
  if(!tags){return { cleanedTags, invalidTags }}
  tags.forEach((tag: string, i: number) => {
    if (!tag) return;
    let checked = checkTag(tag);
    if (checked) {
      cleanedTags.push(checked);
    } else {
      invalidTags.push(tag);
    }
  });

  return { cleanedTags, invalidTags };
};
