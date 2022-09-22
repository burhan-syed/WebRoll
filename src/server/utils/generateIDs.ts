import {nanoid} from 'nanoid'
import crypto from "crypto";

export const generateSiteId = () => {
  return nanoid(7)
}


export const randomSessionID = (bytes = 24) =>
  crypto.randomBytes(bytes).toString("hex");
