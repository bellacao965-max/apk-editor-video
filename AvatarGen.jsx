import React, {useRef, useState} from 'react'

export default function AvatarGen(){
  const inputRef = useRef()
  const canvasRef = useRef()
  const [src,setSrc] = useState(null)

  function load(e){
    const f=e.target.files?.[0]; if(!f) return
    const url = URL.createObjectURL(f); setSrc(url)
    const img = new Image(); img.src = url
    img.onload = ()=>{
      const c = canvasRef.current; const ctx = c.getContext('2d')
      const size = 512; c.width = size; c.height = size
      // draw face-centered crop
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min)/2, sy = (img.height - min)/2
      ctx.drawImage(img, sx, sy, min, min, 0,0,size,size)
      // simple posterize/cartoon effect
      const d = ctx.getImageData(0,0,size,size)
      for(let i=0;i<d.data.length;i+=4){
        d.data[i] = Math.floor(d.data[i]/32)*32
        d.data[i+1] = Math.floor(d.data[i+1]/32)*32
        d.data[i+2] = Math.floor(d.data[i+2]/32)*32
      }
      ctx.putImageData(d,0,0)
      // add circular mask
      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath(); ctx.arc(size/2,size/2,size/2,0,Math.PI*2); ctx.closePath(); ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  function download(){
    const a = document.createElement('a'); a.href = canvasRef.current.toDataURL('image/png'); a.download='avatar.png'; a.click()
  }

  return (
    <div>
      <input type='file' accept='image/*' onChange={load}/>
      <div style={{marginTop:8}}>
        <canvas ref={canvasRef} style={{width:256,height:256,borderRadius:16}} />
      </div>
      <div style={{marginTop:8}}>
        <button onClick={download}>Download Avatar</button>
      </div>
      <p style={{marginTop:8}}>AI Avatar Generator: simple client-side posterize + circular crop. For advanced avatars (styleGAN/Pix2Pix) run a server model — see README.</p>
    </div>
  )
}
