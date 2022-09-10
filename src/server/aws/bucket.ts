import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
//import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {getSignedUrl} from "@aws-sdk/cloudfront-signer"
import crypto from 'crypto'; 

const bucket = import.meta.env.AWS_BUCKET_NAME;
const region = import.meta.env.AWS_BUCKET_REGION;
const accessKeyId = import.meta.env.AWS_ACCESS_KEY as string;
const secretAccessKey = import.meta.env.AWS_SECRET_KEY as string;
const cloudfrontDomain = import.meta.env.CLOUDFRONT_DOMAIN; 
//const cloudfrontPrivateKey = fs.readFileSync('private_key.pem'); 
const cloudfrontPrivateKey = Buffer.from(import.meta.env.CLOUDFRONT_PRIVATE_KEY_64, 'base64');
const cloudfrontKeyPairID = import.meta.env.CLOUDFRONT_KEYPAIR_ID; 
const s3 = new S3Client({
  credentials: { accessKeyId, secretAccessKey },
  region: 'us-east-2',
});

const randomImageName = (bytes=32) => crypto.randomBytes(bytes).toString('hex');

export const putImageObject = async ({
  image,
  siteURL,
}: {
  image: string | Buffer;
  siteURL: string;
  key?: string;
}) => {
  const imgKey = randomImageName()
  const params = {
    Body: image,
    Bucket: bucket,
    Key: imgKey,
    Metadata: { siteURL: siteURL },
    ContentType: "image/webp"
  };
  const command = new PutObjectCommand(params); 
  const res = await s3.send(command); 
  console.log("upload:", res);
  return imgKey;
};

export const getSignedImageUrl = async(fileKey: string) => {
  const url = await getSignedUrl({
    url: `${cloudfrontDomain}${fileKey}`, 
    dateLessThan:  new Date(Date.now() + 1000 * 60 * 60 * 24) as unknown as string,
    privateKey: cloudfrontPrivateKey, 
    keyPairId: cloudfrontKeyPairID,
  });
  return url; 
};
