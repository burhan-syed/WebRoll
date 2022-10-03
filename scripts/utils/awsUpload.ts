import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
//import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
//import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import crypto from "crypto";
import * as dotenv from 'dotenv';
dotenv.config(); 

const bucket =  process.env?.AWS_BUCKET_NAME;
const region = process.env?.AWS_BUCKET_REGION;
const accessKeyId = process.env?.MY_AWS_ACCESS_KEY as string;
const secretAccessKey = process.env?.MY_AWS_SECRET_KEY as string;
// const cloudfrontDomain = process.env?.CLOUDFRONT_DOMAIN;
// //const cloudfrontPrivateKey = fs.readFileSync('private_key.pem');
// const cloudfrontPrivateKey = Buffer.from(
//   process.env.CLOUDFRONT_PRIVATE_KEY_64 as string,
//   "base64"
// );
// const cloudfrontKeyPairID = process.env.CLOUDFRONT_KEYPAIR_ID;
const s3 = new S3Client({
  credentials: { accessKeyId, secretAccessKey },
  region: region,
});

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const putImageObject = async ({
  image,
  siteURL,
}: {
  image: string | Buffer;
  siteURL: string;
  key?: string;
}) => {
  const imgKey = randomImageName();
  const params = {
    Body: image,
    Bucket: bucket,
    Key: imgKey,
    Metadata: { siteURL: siteURL },
    ContentType: "image/jpeg",
  };
  const command = new PutObjectCommand(params);
  const res = await s3.send(command);
  return imgKey;
};