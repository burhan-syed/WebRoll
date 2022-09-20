import { useEffect, useState } from "react";

export default function SecureImg({
  imgKey,
  styles = "",
}: {
  imgKey: string | null;
  styles?: string;
}) {
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    const getImage = async () => {
      const res = await fetch(`/api/images/${imgKey}`);
      console.log("res:", res);
      if (res.ok) {
        const data = await res.json();
        setImgSrc(data?.url);
      }
    };
    if (imgKey && !imgSrc) {
      getImage();
    }
  }, []);

  return <img className={styles} src={imgSrc} alt="" />;
}
