import type { APIRoute } from "astro";
import { randomSessionID } from "../../../server/utils/generateIDs";
import {getWebRollSession} from "../../../server/utils/parseCookieString";
import { hashPassword } from "../../../server/utils/passwordHasher";
import prisma from "../../../server/utils/prisma";
export const post: APIRoute = async function post({ request }) {
  const sessionID = getWebRollSession(request.headers.get("cookie")); 
  const data = await request.json();
  const { email, password } = data;
  console.log("session?", sessionID, "email?", email, "password?", password);

  if (!email || !password || !sessionID) {
    return new Response(JSON.stringify({ ERROR: "invalid" }), { status: 400 });
  }
  try {
    const sessData = await prisma.sessions.findFirst({
      where: { id: sessionID },
    });
    console.log("sess?", sessData); 
    if (!sessData) {
      return new Response(JSON.stringify({ ERROR: "role" }), { status: 401 });
    }
    const pAccount = await prisma.accounts.findFirst({
      where: { email: email },
    });
    console.log("prev Account?", pAccount)
    if (pAccount) {
      return new Response(JSON.stringify({ ERROR: "email" }), {
        status: 400,
      });
    }
    const hashed = await hashPassword(password);
    console.log("hashed?", hashed);
    const newSession = randomSessionID(); 
    const account = await prisma.accounts.create({
      data: {
        email: email,
        password: hashed,
        sessions: { create: [{id: newSession, ip: ""}] },
      },
    });
    console.log("account?", account); 
    return new Response(JSON.stringify({ email: account.email }), {
      status: 200,
    });
  } catch (err) {
    console.log("signup error", err);
    return new Response(null, { status: 500 });
  }
};
