import React, { useEffect, useState } from 'react'

const SecureImg = ({imgKey,styles=""}:{imgKey:string,styles?:string}) => {
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    const getImage = async() => {
      const res = await fetch(`/api/images/${imgKey}`); 
      console.log("res:", res); 
      if(res.ok){
        const data = await res.json(); 
        setImgSrc(data?.url); 
      }
    }
    if(imgKey && !imgSrc){
      getImage(); 
    }
  }, [])
   
  return (
    <img className={styles} src={imgSrc} alt="" />
  )
}

export default SecureImg