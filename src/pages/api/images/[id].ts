import type { APIRoute } from "astro";
import { getImage } from "@astrojs/image";

import { getSignedImageUrl } from "../../../server/aws/bucket";

export const get: APIRoute = async function get({ params }) {
  const { id, hd = true } = params;
  if (!id) return new Response(null, { status: 400 });

  try {
    let signedURL = await getSignedImageUrl(id as string);
    if (!hd) {
      const { src } = await getImage({
        format: "webp",
        quality: 80,
        width: 1080,
        height: 1920,
        src: signedURL,
        fit: "outside",
      });
      if (src) signedURL = src;
    }

    return new Response(JSON.stringify({ url: signedURL }), { status: 200 });
  } catch (err) {
    console.log("SIGN ERR", err);
    return new Response(JSON.stringify({ ERROR: err }), { status: 400 });
  }
};
