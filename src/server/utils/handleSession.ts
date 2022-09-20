import prisma from "../utils/prisma";
import crypto from "crypto";
import parseCookie from "./parseCookieString";
import jwt from "jsonwebtoken";

const randomSessionID = (bytes = 24) =>
  crypto.randomBytes(bytes).toString("hex");

export const checkAndReturnSessionID = async (
  ip: string,
  cookies: string | null
) => {
  const parsedCookie = parseCookie(cookies ?? "");
  console.log("parsed", parsedCookie);
  const sessionID = (() => {
    try {
      const sessionCookie = parsedCookie?.["__astroauth__session__"] ?? "";
      if (sessionCookie) {
        const decoded = jwt.verify(
          sessionCookie,
          import.meta.env.ASTROAUTH_SECRET
        ) as any;
        console.log("decoded?", decoded); 
        if(decoded?.["session"]?.length === 48){
          return decoded?.["session"]
        }
      }
    } catch (err) {
      console.log("jwt parse error", err); 
    }

    return parsedCookie?.webroll_session?.length === 48
      ? parsedCookie.webroll_session
      : randomSessionID();
  })();
  console.log("sessionID?", sessionID, " | length?", sessionID.length);
  const update = await prisma.sessions.upsert({
    where: { id: sessionID },
    create: { ip, id: sessionID },
    update: { ip, lastAccessed: new Date() },
  });

  return update.id;
};
