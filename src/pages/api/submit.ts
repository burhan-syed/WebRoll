
export async function get(_params: any, request:Request){
  //const data = await request.json(); 
  console.log(request);
  return  {
    body: JSON.stringify({"response": "Hi"}),
  }
}