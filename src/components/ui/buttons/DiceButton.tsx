import React, { useEffect, useRef, useState } from 'react'
import Dice from '../icons/Dice'
import "../../../styles/animation.css"
const DiceButton = ({action}:{action:Function}) => {
  const [animate, setAnimate] = useState(false)
  const animateRef = useRef<any>(null); 
  useEffect(() => {
    if(animate){
      animateRef.current = setTimeout(() => {setAnimate(false)}, 500)
    }
    return () => {
      clearTimeout(animateRef.current)
    }
  }, [animate])
  
  return (
    <button
    className="flex gap-2 btn btn-primary text-primary-content "
    onClick={() => {setAnimate(true); action()}}
  >
    Next
    <div className={"flex-none animated " + (animate ? " rotate " : "") }>
      <Dice size={20} strokeWidth={30} color={"currentColor"} />
    </div>
  </button>
  )
}

export default DiceButton