import React from 'react'
import type { SiteResData } from '../types'
// interface Props{
//   url:string,
//   name:string,
//   description?:string,
//   categories: {category:string,description:string}[],
//   tags: {tag:string}[]
// }
const SiteCard = ({url,name,description,categories,tags}:SiteResData) => {
  return (
    <div>a{name}</div>
  )
}

export default SiteCard