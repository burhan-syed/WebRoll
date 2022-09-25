import { getUser } from "@astro-auth/core";
import prisma from "../../../server/utils/prisma";
import type { APIRoute } from "astro";
import type { User } from "../../../types";
import postParseRequest from "../../../server/metaparser/parseRequest";


export const post: APIRoute = async function post({ request }) {
  const user = getUser({ server: request }) as User;
  if (user?.role !== "ADMIN") {
    return new Response(null, { status: 401 });
  }
  const { siteID } = await request.json();
  if (!siteID) {
    return new Response(null, { status: 400 });
  }
  try {
    const site = await prisma.sites.findFirst({ where: { id: siteID } });
    if (!site) {
      return new Response(null, { status: 400 });
    }
    const res = await postParseRequest({
      siteURL: site.url,
      siteID: site.id,
      assignerID: site.submitterID,
    });
    if(!res.ok){
      return new Response("parse error", {status: 500});
    }
    const data = await res.json(); 
    return new Response(data, { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
};
