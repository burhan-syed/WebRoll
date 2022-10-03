

const BLACKLIST_SOURCE = import.meta.env.BLACKLIST_SOURCE;
//const BLACKLIST_PATH = "./blacklist.txt";

const fetchFile = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error("unable to fetch file");
  }
  return await res.text()
};


export const checkInBlacklist = async (url: string) => {
  const urlToCheck = url.replace("https://","").replace("https://",""); 
  try {
    const contents = await fetchFile(BLACKLIST_SOURCE);
    const contains = contents.includes(urlToCheck);
    return contains;
  } catch (err) {
    console.error("READ FILE ERROR", err);
    return true;
  }
};
