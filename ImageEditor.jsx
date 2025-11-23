import React, {useRef,useState,useEffect} from 'react'
import StickersPanel from './StickersPanel'
import * as bodyPix from '@tensorflow-models/body-pix'
import * as faceLandmarks from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs'

export default function ImageEditor(){
  const canvasRef = useRef()
  const [imgSrc,setImgSrc] = useState(null)
  const [stickers,setStickers] = useState([])
  const [packs] = useState([
    ['/stickers/emoji/sample.png']
  ])
  const [bpModel,setBpModel] = useState(null)
  const [faceModel,setFaceModel] = useState(null)

  useEffect(()=>{ (async()=>{
    try{ setBpModel(await bodyPix.load()) }catch(e){console.warn(e) }
    try{ setFaceModel(await faceLandmarks.load(faceLandmarks.SupportedPackages.mediapipeFacemesh)) }catch(e){console.warn(e) }
  })() },[])

  function loadImage(e){
    const f=e.target.files?.[0]; if(!f) return
    setImgSrc(URL.createObjectURL(f))
  }

  useEffect(()=>{
    if(!imgSrc) return
    const img = new Image(); img.src=imgSrc
    img.onload = ()=>{
      const c=canvasRef.current; c.width=img.width; c.height=img.height
      const ctx=c.getContext('2d'); ctx.drawImage(img,0,0)
      redraw()
    }
    // eslint-disable-next-line
  },[imgSrc])

  function addSticker(src){ setStickers(s=>[...s,{src,x:20,y:20,w:80,h:80}]) }

  // drag handling for stickers
  function startDrag(i,e){
    const startX=e.clientX, startY=e.clientY
    const orig = {...stickers[i]}
    function move(ev){
      const dx = ev.clientX - startX, dy = ev.clientY - startY
      stickers[i].x = orig.x + dx; stickers[i].y = orig.y + dy
      // trigger repaint
      setStickers([...stickers])
    }
    function up(){ window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  function redraw(){
    const c=canvasRef.current; if(!c) return
    const ctx = c.getContext('2d')
    const img = new Image(); img.src = imgSrc
    img.onload = ()=>{
      ctx.clearRect(0,0,c.width,c.height)
      ctx.drawImage(img,0,0)
      stickers.forEach(s=>{
        const st = new Image(); st.src = s.src
        st.onload = ()=> ctx.drawImage(st, s.x, s.y, s.w, s.h)
      })
    }
  }

  useEffect(()=>{ redraw() },[stickers])

  async function applyChromaKey(bgColor='#00ff00', threshold=60){
    const c=canvasRef.current; const ctx=c.getContext('2d')
    const imgData = ctx.getImageData(0,0,c.width,c.height)
    const d = imgData.data
    const [rG,gG,bG] = [parseInt(bgColor.slice(1,3),16), parseInt(bgColor.slice(3,5),16), parseInt(bgColor.slice(5,7),16)]
    for(let i=0;i<d.length;i+=4){
      const dr = d[i]-rG, dg = d[i+1]-gG, db = d[i+2]-bG
      const dist = Math.sqrt(dr*dr+dg*dg+db*db)
      if(dist < threshold){ d[i+3] = 0 }
    }
    ctx.putImageData(imgData,0,0)
  }

  async function faceTrack(){
    if(!faceModel) return alert('Face model not loaded yet')
    const c=canvasRef.current; const ctx=c.getContext('2d')
    const preds = await faceModel.estimateFaces({input:c})
    ctx.strokeStyle='red'; ctx.lineWidth=2
    preds.forEach(p=>{
      const key = p.scaledMesh || p.annotations || []
      // draw bounding box
      const xs = key.map(k=>k[0]), ys = key.map(k=>k[1])
      const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys)
      ctx.strokeRect(minX,minY,maxX-minX,maxY-minY)
    })
  }

  // Simple body-slim effect: scale person area horizontally slightly using segmentation mask
  async function bodySlim(factor=0.85){
    if(!bpModel) return alert('Segmentation model not loaded')
    const c=canvasRef.current; const ctx=c.getContext('2d')
    const seg = await bpModel.segmentPerson(c, {internalResolution:'medium'})
    const mask = bodyPix.toMask(seg)
    const w=c.width, h=c.height
    // copy person pixels to offscreen canvas, scale horizontally, then composite
    const off = document.createElement('canvas'); off.width=w; off.height=h
    const offCtx = off.getContext('2d')
    offCtx.putImageData(ctx.getImageData(0,0,w,h),0,0)
    // create person-only canvas
    const person = document.createElement('canvas'); person.width=w; person.height=h
    const pctx = person.getContext('2d')
    pctx.putImageData(ctx.getImageData(0,0,w,h),0,0)
    const imgData = pctx.getImageData(0,0,w,h)
    // make transparent where not person
    for(let i=0;i<imgData.data.length;i+=4){
      if(mask.data[i+3]===0){ imgData.data[i+3]=0 }
    }
    pctx.putImageData(imgData,0,0)
    // draw background from off canvas
    ctx.clearRect(0,0,w,h)
    ctx.drawImage(off,0,0)
    // draw scaled person centered
    ctx.save()
    ctx.translate(w/2,0)
    ctx.scale(factor,1)
    ctx.drawImage(person, -w/2, 0)
    ctx.restore()
  }

  function exportPNG(){ const c=canvasRef.current; const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='export.png'; a.click() }

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input type='file' accept='image/*' onChange={loadImage}/>
        <button onClick={()=>applyChromaKey('#00ff00',60)}>Green Screen (Chroma Key)</button>
        <button onClick={faceTrack}>Face Track (draw boxes)</button>
        <button onClick={()=>bodySlim(0.85)}>Body Slim AI</button>
        <button onClick={exportPNG}>Export PNG</button>
      </div>
      <div style={{display:'flex',gap:12}}>
        <div style={{flex:'1 1 0%'}}>
          <canvas ref={canvasRef} style={{maxWidth:'90%'}}/>
        </div>
        <div style={{width:260}}>
          <h4>Stickers</h4>
          <StickersPanel packs={packs} onAdd={(s)=>{ setStickers(st=>[...st,{src:s,x:30,y:30,w:80,h:80}]) }} />
          <div style={{marginTop:12}}>
            <h4>Sticker drag</h4>
            <p>Drag stickers directly on canvas area below.</p>
            {stickers.map((s,i)=>(
              <img key={i} src={s.src} style={{width:80,position:'absolute',left:s.x,top:s.y,cursor:'grab'}} onMouseDown={(e)=>{ e.preventDefault(); const startX=e.clientX,startY=e.clientY; const origX=s.x, origY=s.y; function move(ev){ s.x = origX + ev.clientX - startX; s.y = origY + ev.clientY - startY; /* trigger */ } function up(){ window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up) } window.addEventListener('mousemove',move); window.addEventListener('mouseup',up) }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
