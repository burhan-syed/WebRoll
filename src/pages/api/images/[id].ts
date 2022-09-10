import type {APIRoute} from 'astro'
import { getSignedImageUrl } from '../../../server/aws/bucket';

export const get: APIRoute = async function get({params}){

  const {id} = params; 
  if(!id)return new Response(null, {status: 400}); 
 
  try{
    const signedURL = await getSignedImageUrl(id as string); 
    return new Response(JSON.stringify({url: signedURL}), {status: 200})
  }catch(err){
    console.log("SIGN ERR", err); 
    return new Response(JSON.stringify({ERROR: err}),{status: 400} )
  }
}