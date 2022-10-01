import type { APIRoute } from "astro";
import { getUser } from "@astro-auth/core";
import prisma from "../../../server/utils/prisma";
import type { SitesQuery, User } from "../../../types";
import type { ReportType, SiteStatus } from "@prisma/client";
export const get: APIRoute = async function get({ request }) {
  const user = getUser({ server: request }) as User;
  if (!user || user.role !== "ADMIN") {
    return new Response(null, { status: 401 });
  }

  let params = new URLSearchParams(request.url?.split("?")?.[1]);

  const queryParams = {
    reportTypes: JSON.parse(
      params?.get("reportTypes") ??
        `["BROKEN", "CATEGORY", "DISPLAY", "OTHER", "TAGS", "TAGS", "TOS"]`
    ) as ReportType[],
    select: JSON.parse(params?.get("select") ?? "20"),
    cursor: JSON.parse(params?.get("cursor") ?? "undefined"),
  };

  const {
    reportTypes = [
      "BROKEN",
      "CATEGORY",
      "DISPLAY",
      "OTHER",
      "TAGS",
      "TAGS",
      "TOS",
    ],
    select = 20,
    cursor,
  } = queryParams;
  try {
    console.log("rT?", reportTypes);
    const total = await prisma.sites.count({
      where: {
        Reports: { some: { type: { in: reportTypes }, resolved: false } },
      },
    });
    const sites = await prisma.sites.findMany({
      where: {
        Reports: { some: { type: { in: reportTypes }, resolved: false } },
      },
      orderBy: { Reports: { _count: "desc" } },
      take: select + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: { Reports: { select: { type: true } } },
    });
    let nextCursor = undefined;
    if (sites.length > select) {
      let last = sites.pop();
      console.log("Rsites?", last?.Reports);

      nextCursor = last?.id;
    }
    console.log("Rsites?", sites?.[0]?.Reports);
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
