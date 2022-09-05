const decode = (str: string) =>
  str.replace(/&#x?(\d+);/g, function (match, dec) {
    return String.fromCharCode(dec);
  });
const fetchMetadata = async (url: string) => {
  console.log("fetch..", url);
  const html = await (
    await fetch(url, {
      headers: {
        "User-Agent": "request",
      },
    })
  ).text();
  //console.log("fetch text..", html)
  let metadata = {} as any;
  const head = html.split("</head>")[0];

  const metas = head.split("<meta ");
  metas.forEach((meta, i) => {
    if (i === 0) return;
    //console.log("meta", meta);
    if (meta.includes("name=") && meta.includes("content=")) {
      const name = meta.split("name=")?.[1]?.split(`"`);
      //console.log("name:", name);
      const content = meta.split("content=")?.[1]?.split(`"`);
      //console.log("content:", content);
    }
    meta.replace(
      /(property|name)="(.*?)".+content="(.*?)".*\/>/gim,
      (match: any, p0: any, p1: any, p2: any) => {
        //console.log("replace", match, "P0", p0, "P1", p1, "P2", p2);
        metadata[p1] = decode(p2);
        return "";
      }
    );
  });

  const siteTitle = head?.split("<title>")?.[1]?.split("</title>")?.[0];
  metadata["SiteTitle"] = siteTitle;

  return metadata;
};

export default fetchMetadata;
