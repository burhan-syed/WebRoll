import type { APIRoute } from "astro";
import { randomSessionID } from "../../../server/utils/generateIDs";
import { hashPassword } from "../../../server/utils/passwordHasher";
import prisma from "../../../server/utils/prisma";
import { generateAndSendAuthVerificationMail } from "../../../server/utils/sendEmail";
export const post: APIRoute = async function post({ request }) {
  const data = await request.json();
  const { key, password1, password2 } = data;
  if (!key || !password1 || !password2 || password1 !== password2 || !(password1.length >=9)) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const verification = await prisma.accountVerifications.findUnique({
      where: { id: key },
      include: { account: true },
    });
    if (
      !verification ||
      verification?.account?.status === "BANNED" ||
      verification.verificationType !== "RESET"
    )
      return new Response("invalid verification", { status: 400 });
    const hashed = await hashPassword(password1);
    const updatePW = await prisma.$transaction([
      prisma.accounts.update({
        where: { email: verification.account.email },
        data: { password: hashed },
      }),
      prisma.accountVerifications.delete({ where: { id: verification.id } }),
    ]);
    return new Response(null, { status: 200 });
  } catch (err) {
    console.log("verif error", err);
    return new Response(null, { status: 500 });
  }
};
