const API_KEY = import.meta.env.GOOGLE_CLOUD_API_KEY; 
export const assessURLRisk = async(URL:string) => {
  const threatTypes = ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"];
  const url = `https://webrisk.googleapis.com/v1/uris:search?${threatTypes.map(t => (`threatTypes=${t}`)).join('&')}&uri=${encodeURIComponent(URL)}`
  console.log("risk url?", url);
  const res = await fetch(url, {method: "get", headers: {"Authorization": `Bearer ${API_KEY}`}});
  console.log("risk?", res); 
  const data = await res.json();
  console.log("risk data?", data); 

  return data;  
}