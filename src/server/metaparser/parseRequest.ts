const parseDomain = import.meta.env.PARSER_DOMAIN;
const key = import.meta.env.MY_SECRET_KEY;

export default async function postParseRequest({siteURL, siteID, assignerID}: {siteURL:string; siteID:string;assignerID:string}) {
  const res = await fetch(parseDomain, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: siteURL,
      key: key,
      siteID: siteID,
      assigner: assignerID,
    }),
  });
  return res; 
}