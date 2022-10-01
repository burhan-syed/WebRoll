import crypto from "crypto";

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  const [hash, salt] = hashedPassword.split(".");
  const buff = await crypto.scryptSync(plainPassword, salt, 64);
  return buff.toString("hex") === hash;
};

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(32).toString("hex");
  const buff = await crypto.scryptSync(password, salt, 64);
  return `${buff.toString("hex")}.${salt}`;
};
