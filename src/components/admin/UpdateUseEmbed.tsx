import React, { useState } from "react";

export default function UpdateUseEmbed({
  siteID,
  allowEmbed,
}: {
  siteID: string;
  allowEmbed: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [embed, setEmbed] = useState(() => allowEmbed)
  const changeAllowEmbed = async () => {
    setLoading(true);
    try{
      const res = await fetch("/api/update-site", {
        method: "post",
        body: JSON.stringify({
          siteData: { id: siteID, allowEmbed: !embed },
        }),
      });
      if(res.ok){
        const data = await res.json(); 
        setEmbed(data?.data?.allowEmbed)
      }
    }catch(err){

    }
    setLoading(false);
   
  };
  return (
    <button
      onClick={changeAllowEmbed}
      className={"btn " + (loading ? " loading " : "")}
    >
      {embed ? "Disable " : "Enable "}Embed
    </button>
  );
}
