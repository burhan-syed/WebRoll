import sharp from 'sharp'; 

export const compressImage = async(image: any, maxSizeKB=500) => {
  let byteLength = Infinity; 
  let loops = 0; 
  let buffer = image; 
  while (byteLength > (maxSizeKB*1000) && loops < 20){
    buffer = await sharp(buffer).jpeg({ quality: loops > 10 ? 5 : loops >= 5 ? 20 : 50 }).toBuffer()
    byteLength = Buffer.byteLength(buffer);  
    //console.log("bytelength?", byteLength);
    loops++; 
  }
  return buffer; 
}