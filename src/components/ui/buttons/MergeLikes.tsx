import { useState } from "react";

export default function MergeLikes() {
  const [loading, setLoading] = useState(false);
  const [merged, setMerged] = useState(false);
  const [error, setError] = useState(false); 
  const mergeLikes = async () => {
    if(!loading){
      setLoading(true);
      setError(false); 
      try {
        const res = await fetch("/api/merge-likes", {method: "post"});
        if (res.ok) {
          setMerged(true);
          window?.location?.reload(); 
        }
      } catch (err) {
        setError(true)
      }
      setLoading(false);
    }
    
  };

  return (
    <>
      <button
      disabled={merged}
      onClick={mergeLikes}
      className={"btn " + (loading ? "loading" : "")}
    >
      {merged ? "Saved" : "Save Likes"}
    </button>
    {error && <span className="text-xs text-error mx-auto">something went wrong</span>}
    </>
  
  );
}
