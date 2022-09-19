import crypto from 'crypto'

export const comparePassword = async(plainPassword: string, hashedPassword: string) => {
  const [hash,salt] = hashedPassword.split(".");
  console.log("hash/salt?", hash,salt)
  const buff = (await crypto.scryptSync(plainPassword, salt, 64)); 
  console.log("buff?", buff.toString("hex"), "verif?", buff.toString("hex") === hash)
  return buff.toString("hex") === hash;
  //return await bcrypt.compare(plainPassword, hashedPassword); 
}

export const hashPassword = async(password: string) => {
  console.log("hash..")
  const salt = crypto.randomBytes(32).toString('hex'); 
  console.log("salt", salt)
  const buff = (await crypto.scryptSync(password, salt, 64)) 
  console.log("buff", buff.toString("hex"))
  return `${buff.toString("hex")}.${salt}`
  //return await bcrypt.hash(password, 10); 
}