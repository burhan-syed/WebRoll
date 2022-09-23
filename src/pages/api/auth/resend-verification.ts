import type { APIRoute } from "astro";
import { randomSessionID } from "../../../server/utils/generateIDs";
import prisma from "../../../server/utils/prisma";
import { generateAndSendAuthVerificationMail } from "../../../server/utils/sendEmail";
export const post: APIRoute = async function post({ request }) {
  
  const data = await request.json();
  const { email, key } = data;
  if (!email && !key) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const pVerification = await prisma.accountVerifications.findUnique({
      where: { id: key },
      include: { account: true },
    });
    if (!pVerification || pVerification?.account?.status !== "PENDING") return new Response("invalid key", { status: 400 });
    const emailVerifId = randomSessionID(64);
    const expires = new Date(Date.now() + 1000 * 60 * 24); 
    const createVerif = await prisma.accountVerifications.create({
      data: {
        id: emailVerifId,
        expiresAt: expires,
        account: { connect: { email: pVerification.account.email } },
      },
    });
    try{
      await generateAndSendAuthVerificationMail({recipient: pVerification.account.email, verificationKey: emailVerifId})
    }catch(err){
      await prisma.$transaction([
        prisma.accountVerifications.delete({where: {id: emailVerifId}})
      ])
      return new Response(null, {status:500}) 
    }
    return new Response(null, { status: 200 });
  } catch (err) {
    console.log("verif error", err);
    return new Response(null, { status: 500 });
  }
};
