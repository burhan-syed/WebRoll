import type { APIRoute } from "astro";
import { getUser } from "@astro-auth/core";
import prisma from "../../../server/utils/prisma";
import type { SitesQuery, User } from "../../../types";
import type { SiteStatus } from "@prisma/client";
export const get: APIRoute = async function get({ request }) {
  const user = getUser({ server: request }) as User;
  if (!user || user.role !== "ADMIN") {
    return new Response(null, { status: 401 });
  }

  let params = new URLSearchParams(request.url?.split("?")?.[1]);

  const queryParams = {
    sort: JSON.parse(params?.get("sort") ?? ""),
    status: JSON.parse(
      params?.get("status") ?? `["REVIEW", "PARSING"]`
    ) as SiteStatus[],
    categories: JSON.parse(params?.get("categories") ?? ""),
    select: JSON.parse(params?.get("select") ?? "1"),
    cursor: JSON.parse(params?.get("cursor") ?? "undefined"),
  } as SitesQuery;

  const {
    sort = "DATE",
    status = ["REVIEW", "PARSING"],
    categories,
    select = 20,
    cursor,
  } = queryParams;
  //console.log("sort?", sort, "status", status, "categories?",categories, "select?", select, "cursor?", cursor)
  try {
    //TODO: filter categories, sort by other fields
    const selectedCategories =
      categories !== undefined
        ? { categories: { some: { id: { in: [...categories] } } } }
        : {};
    const filter = { status: { in: status } };
    const total = await prisma.sites.count({ where: { ...filter } });
    const sites = await prisma.sites.findMany({
      where: { ...filter },
      orderBy: { submittedAt: "desc" },
      take: select + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    let nextCursor = undefined;
    if (sites.length > select) {
      let last = sites.pop();
      nextCursor = last?.id;
    }
    return new Response(
      JSON.stringify({ data: sites, nextCursor: nextCursor, total }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log("query err", err);
    return new Response(JSON.stringify({ ERROR: "" }), { status: 500 });
  }

  return new Response(JSON.stringify({ ERROR: "" }), { status: 401 });
};
