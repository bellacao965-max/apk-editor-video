import React,{useState} from 'react'
import ImageEditor from './components/ImageEditor'
import VideoEditor from './components/VideoEditor'
import AvatarGen from './components/AvatarGen'

export default function App(){
  const [mode,setMode]=useState('image')
  return (
    <div>
      <h1>Editor Ultimate</h1>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button onClick={()=>setMode('image')}>Image</button>
        <button onClick={()=>setMode('video')}>Video</button>
        <button onClick={()=>setMode('avatar')}>AI Avatar</button>
      </div>
      <div className='panel'>
        {mode==='image' && <ImageEditor/>}
        {mode==='video' && <VideoEditor/>}
        {mode==='avatar' && <AvatarGen/>}
      </div>
    </div>
  )
}
