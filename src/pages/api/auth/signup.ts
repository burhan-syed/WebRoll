import type { APIRoute } from "astro";
import { randomSessionID } from "../../../server/utils/generateIDs";
import { getWebRollSession } from "../../../server/utils/parseCookieString";
import { hashPassword } from "../../../server/utils/passwordHasher";
import prisma from "../../../server/utils/prisma";
import { generateAndSendAuthVerificationMail } from "../../../server/utils/sendEmail";

const isProd = import.meta.env.PROD;
export const post: APIRoute = async function post({ request }) {
  const sessionID = getWebRollSession(request.headers.get("cookie"));
  const data = await request.json();
  const { email, password } = data;
  //console.log("session?", sessionID, "email?", email, "password?", password);
  const ip =
    request.headers.get("x-forwarded-for") ?? !isProd ? "127.0.0.1" : null;

  if (!email || !password || !sessionID || !ip || !(password.length >= 9)) {
    return new Response(JSON.stringify({ ERROR: "invalid" }), { status: 400 });
  }
  try {
    const sessData = await prisma.sessions.findFirst({
      where: { id: sessionID },
    });
    //console.log("sess?", sessData);
    if (!sessData) {
      return new Response(JSON.stringify({ ERROR: "role" }), { status: 401 });
    }
    const pAccount = await prisma.accounts.findFirst({
      where: { email: email },
    });
    //console.log("prev Account?", pAccount);
    if (pAccount) {
      return new Response(JSON.stringify({ ERROR: "email" }), {
        status: 400,
      });
    }
    const hashed = await hashPassword(password);
    //console.log("hashed?", hashed);
    const newSession = randomSessionID();
    const emailVerifId = randomSessionID(64);

    const account = await prisma.accountVerifications.create({
      data: {
        id: emailVerifId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 24),
        account: {
          create: {
            email: email,
            password: hashed,
            sessions: { create: [{ id: newSession, ip: ip }] },
          },
        },
      },
      include: {
        account: true,
      },
    });
    try {
      await generateAndSendAuthVerificationMail({
        recipient: email,
        verificationKey: emailVerifId,
      });
    } catch (err) {
      //console.log("something went wrong with email verif", err);
      await prisma.$transaction([
        prisma.accountVerifications.delete({ where: { id: emailVerifId } }),
        prisma.sessions.delete({ where: { id: newSession } }),
        prisma.accounts.delete({ where: { email: email } }),
      ]);
      return new Response(null, { status: 500 });
    }
    return new Response(JSON.stringify({ email: account.account.email }), {
      status: 200,
    });
  } catch (err) {
    console.error("signup error", err);
    return new Response(null, { status: 500 });
  }
};
