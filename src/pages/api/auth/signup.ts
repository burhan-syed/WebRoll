import type { APIRoute } from "astro";
import parseCookie from "../../../server/utils/parseCookieString";
import { hashPassword } from "../../../server/utils/passwordHasher";
import prisma from "../../../server/utils/prisma";
export const post: APIRoute = async function post({ request }) {
  const sessionID = parseCookie(request.headers.get("cookie") ?? "")?.[
    "webroll_session"
  ];

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
    if (!sessData || sessData?.role !== "ADMIN") {
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
    console.log("hashed?", hashed)
    const account = await prisma.accounts.create({
      data: {
        email: email,
        password: hashed,
        sessions: { connect: { id: sessionID } },
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
