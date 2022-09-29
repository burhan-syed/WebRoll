import he from "he";

const decode = (str: string) => {
  const text = he.decode(str);
  return text;
};
const parseMetadata = async (rawHTML:string) => {
  let metadata = {} as any;

  const checkMetas = (html: string) => {
    const head = decode(html.split("</head>")[0]);
    const metas = head.split("<meta ");
    metas.forEach((meta, i) => {
      if (i === 0) return;
      meta.replace(
        /(property|name)="(.*?)".+content="(.*?)".*\/>/gim,
        (match: any, p0: any, p1: any, p2: any) => {
          //console.log("replace", match, "P0", p0, "P1", p1, "P2", p2);
          if (!metadata?.[p1] || p2?.length > metadata[p1]?.length) {
            metadata[p1] = p2;
          }
          return "";
        }
      );
    });
    const siteTitle = head?.split("<title>")?.[1]?.split("</title>")?.[0];
    metadata["title"] = siteTitle;
  };

  //metadata["resURL"] = response.url;
  //const html = await response.text();
  checkMetas(rawHTML);

  return metadata;
};

export default parseMetadata;
