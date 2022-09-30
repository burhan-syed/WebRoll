import prisma from "../utils/prisma";
import { parseCookie } from "./parseCookieString";
import type jwt from "jsonwebtoken";
import { getUser } from "@astro-auth/core";
import { randomSessionID } from "./generateIDs";
import type { AstroGlobal } from "astro";

export const checkAndReturnSessionID = async (Astro: AstroGlobal): Promise<{session: string; prev_session:string|undefined; selected_categories: string[] }>  => {
  const ip = Astro.clientAddress;
  const cookies = Astro.request.headers.get("cookie");
  const webrollSessions = parseCookie(cookies ?? "")?.webroll_session?.split(".");
  console.log("wrSessions?",webrollSessions)
  const prev = (() => {
    if(webrollSessions?.[1]?.length === 48){
      return webrollSessions[1]
    }else if(webrollSessions?.[0]?.length === 48){
      return webrollSessions[0]
    }else{
      return ""; 
    }
  })()
  console.log("old??", prev);
  let { sessionID, user, overwritten } = (() => {
    try {
      const user = getUser({ client: Astro }) as jwt.JwtPayload;
      //console.log("USER:", user);
      if (user && user?.session) {
        return {
          sessionID: user.session,
          user,
          overwritten: user?.session !== prev ? prev : "",
        };
      } else if (
        webrollSessions?.[1]?.length === 48
      ) {
        return {
          sessionID: webrollSessions?.[1] ?? "",
          user,
          overwritten: "",
        };
      }
    } catch (err) {
      console.log("jwt parse error", err);
    }

    return {
      sessionID: prev?.length === 48 ? prev : randomSessionID(),
      user: null,
      overwritten: "",
    };
  })() as { sessionID: string; user: any; overwritten: string };
  const sessionUser = await prisma.sessions.findFirst({
    where: { id: sessionID },
    include: { account: true },
  });

  if (
    sessionUser?.account?.email &&
    sessionUser.account.email !== user?.email
  ) {
    sessionID = randomSessionID();
  }
  const update = await prisma.sessions.upsert({
    where: { id: sessionID },
    create: { ip, id: sessionID },
    update: { ip, lastAccessed: new Date() },
    include: {categories: {select: {category: true}}}
  });
  console.log("SESSIONS?", update, "OVERWRITTEN?", overwritten);
  return { session: update.id, prev_session: overwritten, selected_categories: update.categories.map(c => c.category)};
  //return { session: sessionID, prev_session: overwritten };
};
