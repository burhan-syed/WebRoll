import type { APIRoute } from "astro";
import { randomSessionID } from "../../../server/utils/generateIDs";
import prisma from "../../../server/utils/prisma";
import { generateAndSendAuthVerificationMail } from "../../../server/utils/sendEmail";
export const post: APIRoute = async function post({ request }) {
  
  const data = await request.json();
  const { email } = data;
  if (!email) {
    return new Response("invalid request", { status: 400 });
  }
  try {
    const account = await prisma.accounts.findUnique({
      where: { email: email },
      include: {verifications:true}
    });
    if (!account || account?.status === "BANNED"){
      return new Response(null, { status: 200 });
    } 
    const emailVerifId = randomSessionID(64);
    const expires = new Date(Date.now() + 1000 * 60 * 24); 
    const createVerif = await prisma.accountVerifications.create({
      data: {
        id: emailVerifId,
        expiresAt: expires,
        verificationType: "RESET",
        account: { connect: { email: account.email } },
      },
    });
    try{
      await generateAndSendAuthVerificationMail({recipient: account.email, verificationKey: emailVerifId, type: "RESET"})
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
