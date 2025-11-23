import React,{useState} from 'react'
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg'
const ffmpeg = createFFmpeg({log:true})

export default function VideoEditor(){
  const [file,setFile] = useState(null)
  const [ready,setReady] = useState(false)

  async function loadFF(){ if(!ffmpeg.isLoaded()) await ffmpeg.load(); setReady(true) }

  async function applyFilter(type){
    if(!file) return alert('Select video first')
    if(!ready) await loadFF()
    const data = await fetchFile(file)
    ffmpeg.FS('writeFile','in.mp4', data)
    const filters = {
      warm:['-vf','curves=vintage'],
      cool:['-vf','colorchannelmixer=0.7:0:0:0:0:1:0:0:0:0:0.9:0'],
      cinematic:['-vf','eq=contrast=1.2:brightness=0.02:saturation=1.1'],
      vintage:['-vf','hue=s=0.8,eq=contrast=0.9']
    }[type] || ['-vf','eq=contrast=1']
    await ffmpeg.run('-i','in.mp4', ...filters, 'out.mp4')
    const out = ffmpeg.FS('readFile','out.mp4')
    const url = URL.createObjectURL(new Blob([out.buffer], {type:'video/mp4'}))
    const a = document.createElement('a'); a.href = url; a.download = 'filtered.mp4'; a.click()
  }

  return (
    <div>
      <input type='file' accept='video/*' onChange={e=>setFile(e.target.files[0])} />
      <div style={{marginTop:8}}>
        <button onClick={()=>applyFilter('warm')}>Warm</button>
        <button onClick={()=>applyFilter('cool')}>Cool</button>
        <button onClick={()=>applyFilter('cinematic')}>Cinematic</button>
        <button onClick={()=>applyFilter('vintage')}>Vintage</button>
      </div>
      <p style={{marginTop:8}}>Note: FFmpeg.wasm runs in browser and may be slow for large videos.</p>
    </div>
  )
}
