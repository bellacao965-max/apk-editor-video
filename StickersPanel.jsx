import React from 'react'
export default function StickersPanel({packs,onAdd}){
  return (
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      {packs.flat().map((s,i)=>(
        <img key={i} src={s} width={48} style={{cursor:'pointer'}} onClick={()=>onAdd(s)} />
      ))}
    </div>
  )
}
