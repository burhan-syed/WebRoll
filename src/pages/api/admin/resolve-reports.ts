import { getUser } from "@astro-auth/core";
import prisma from "../../../server/utils/prisma";
import type { APIRoute } from "astro";
import type { User } from "../../../types";

export const post: APIRoute = async function post({ request }) {
  const user = getUser({ server: request }) as User;
  if (user?.role !== "ADMIN") {
    return new Response(null, { status: 401 });
  }
  const { siteID, reportID } = await request.json();
  if (!siteID && !reportID) {
    return new Response("missing ids", { status: 400 });
  }
  try {
    const update = await (reportID
      ? prisma.reports.update({
          where: { id: reportID },
          data: { resolved: true },
        })
      : prisma.reports.updateMany({
          where: { siteId: siteID },
          data: { resolved: true },
        }));
    return new Response(JSON.stringify({ data: update }), { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
};
