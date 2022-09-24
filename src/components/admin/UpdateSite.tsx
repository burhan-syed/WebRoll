import type { SiteStatus } from '@prisma/client';
import React, { useState } from 'react'
import type { SiteResData } from '../../types'
import SecureImg from '../ui/SecureImg';
import UpdateStatuses from './UpdateStatuses'

export default function UpdateSite({site}: {site: SiteResData}) {
  const [status, setStatus] = useState(() => site.status);
  const [parseLoading, setParseLoading] = useState(false); 
  const onUpdateStatus = (newStatus: SiteStatus) => {
    setStatus(newStatus); 
  }
  const onParseRequest = async() => {
    setParseLoading(true); 
    try{
      const res = await fetch('/api/admin/parse-site', {method: "post", body: JSON.stringify({siteID: site.id})});
      console.log("prase req?", res); 
    }catch(err){
      console.log("parse request error", err); 
    }
    setParseLoading(false); 
  }
  return (
    <div className="flex flex-col gap-2">
      <span className='text-xs flex items-center justify-between'><span>current status: {status}</span><span className='flex'>{site.submittedAt.toDateString()},{site.updatedAt.toDateString()}</span></span>
      <div className='aspect-video w-full p-1 rounded-sm bg-neutral'>
        {site.imgKey ?  <SecureImg imgKey={site.imgKey} styles={"my-0"}/> : <span>noimg</span>}
        
      </div>
    <div className="flex gap-1 my-2 flex-wrap justify-center">
      <UpdateStatuses
        siteID={site.id}
        statuses={[
          "APPROVED",
          "BANNED",
          "REJECTED",
          "REVIEW",
        ]}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
    <button onClick={(e) => {e.preventDefault(); e.stopPropagation(); onParseRequest();}} className='btn btn-error  w-full'>re-parse</button>
    <label
      htmlFor="update-modal" 
      className={
        "btn modal-button  btn-active w-full gap-2  "
      }
    >
      <>{"EDIT INFO"}</>
    </label>
  </div>
  )
}
