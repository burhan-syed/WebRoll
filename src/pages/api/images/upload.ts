import type { APIRoute } from "astro";
import { putImageObject } from "../../../server/aws/bucket";
import { compressImage } from "../../../server/utils/images";
import prisma from "../../../server/utils/prisma";

const secret = import.meta.env.MY_SECRET_KEY;

export const post: APIRoute = async function post({ request, params }) {
  //console.log("req", request, params, request.url);
  let rawParams = new URLSearchParams(request.url?.split("?")?.[1]);
  const extractParams = {
    id: rawParams.get("id"),
    url: rawParams.get("url"),
    key: rawParams.get("key"),
    assigner: rawParams.get("assigner"),
    name: rawParams.get("name"),
  };
  const { id, url, key, assigner, name } = extractParams;
  //console.log("image upload?", id, url, key, request);
  if (!key || key !== secret) {
    return new Response("", { status: 401 });
  }
  if (!id || !url || !key) {
    return new Response("missing data", { status: 400 });
  }
  try {
    const data = await request.json();
    if (data?.contents) {
      let buffer = Buffer.from(data?.contents, "base64");
      const compressed = await compressImage(buffer);
      //console.log("COMPRESSED:", compressed);
      const uploadKey = await putImageObject({ image: buffer, siteURL: url });
      const update = await prisma.sites.update({
        where: { id: id },
        data: { imgKey: uploadKey },
      });
      //console.log("UPDATE?", update);
    } else {
      return new Response("missing image", { status: 400 });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("image error", err);
    return new Response(null, { status: 500 });
  }
};
