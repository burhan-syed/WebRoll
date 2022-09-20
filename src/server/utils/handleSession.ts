import prisma from "../utils/prisma";
import crypto from 'crypto'; 
import parseCookie from "./parseCookieString";

const randomSessionID = (bytes = 24) => crypto.randomBytes(bytes).toString('hex')

export const checkAndReturnSessionID = async (
  ip: string,
  cookies: string | null
) => {

  const parsedCookie = parseCookie(cookies ?? "");
  console.log("parsed", parsedCookie)
  const sessionID = parsedCookie?.webroll_session?.length === 48 ? parsedCookie.webroll_session : randomSessionID(); 
  console.log("sessionID?", sessionID, " | length?", sessionID.length)
  const update = await prisma.sessions.upsert({
    where: { id: sessionID },
    create: { ip, id: sessionID },
    update: { ip, lastAccessed: new Date() },
  });

  return update.id; 
};
