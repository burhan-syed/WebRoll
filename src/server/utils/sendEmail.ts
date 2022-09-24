import nodemailer from "nodemailer";

const EMAIL_HOST = import.meta.env.EMAIL_HOST;
const EMAIL_PASSWORD = import.meta.env.EMAIL_PASSWORD;
const EMAIL_USER = import.meta.env.EMAIL_USER;
const EMAIL = import.meta.env.EMAIL;
const DOMAIN = import.meta.env.ASTROAUTH_URL;

export const generateAndSendAuthVerificationMail = async ({
  recipient,
  verificationKey,
  type = "NEW",
}: {
  recipient: string;
  verificationKey: string;
  type?: "NEW" | "RESET";
}) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: EMAIL_HOST,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
    secure: true,
  });
  let failed = false;
  let failError: any;
  await new Promise((resolve, reject) => {
    //verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.log("transport error", error);
        failed = true;
        failError = error;
        reject(error);
      } else {
        console.log("server ready to take messages");
        resolve(success);
      }
    });
  });

  const link = `${DOMAIN}/auth/${
    type === "NEW" ? "verify" : "reset"
  }?v=${verificationKey}`;
  const mailData = {
    from: {
      name: `WebRoll`,
      address: EMAIL,
    },
    to: recipient,
    subject: `${
      type === "NEW"
        ? "Verify your WebRoll Account"
        : "Reset your WebRoll Password"
    }`,
    html: `<div><h1>${
      type === "NEW" ? "Welcome to WebRoll" : "WebRoll Password Reset"
    }</h1><p>${
      type === "NEW"
        ? "Thank you for joining WebRoll! To verify your account please follow "
        : "To reset your password please follow "
    }<a href="${link}">this link</a>.<br/>If you do not recognize this request please ignore this email.</p><p><br/>Link not working? Copy this into your browser's address bar: <a href="${link}">${link}</a><br/><br/><a href="${DOMAIN}">webroll.io</a></p></div>`,
  };

  console.log("MAIL DATA?", mailData);

  await new Promise((resolve, reject) => {
    //send mail
    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        console.log("send mail error", error);
        failed = true;
        failError = error;
      } else {
        console.log("sent email", info);
        resolve(info);
      }
    });
  });

  if (failed) {
    throw new Error(`Email Failure Error: ${failError}`);
  }
};
