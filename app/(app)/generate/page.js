'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 800, c = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > max || h > max) { if (w > h) { h=Math.round(h*max/w); w=max } else { w=Math.round(w*max/h); h=max } }
      c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h)
      URL.revokeObjectURL(url)
      resolve({ data:c.toDataURL('image/jpeg',0.7).split(',')[1], type:'image/jpeg', preview:c.toDataURL('image/jpeg',0.35), name:file.name })
    }
    img.onerror = () => reject(new Error('Failed'))
    img.src = url
  })
}

export default function GeneratePage() {
  const router = useRouter()
  const [updates, setUpdates] = useState({ promotions:'', news:'', highlights:'', avoid:'' })
  const [contentType, setContentType] = useState('full')
  const [extraImages, setExtraImages] = useState([])
  const [generating, setGenerating] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const fileRef = useRef()
  const now = new Date()
  const currentMonth = MONTHS[now.getMonth()]
  const currentYear = now.getFullYear()

  async function generate() {
    setGenerating(true)
    const msgs = ['Reading your profile…','Writing your social posts…','Crafting newsletters…','Building Google posts…','Drafting blog content…','Final touches…']
    let mi = 0
    setLoadMsg(msgs[0])
    const interval = setInterval(() => { mi=(mi+1)%msgs.length; setLoadMsg(msgs[mi]) }, 3000)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, contentType, extraImages, month: currentMonth, year: currentYear })
      })
      if (!res.ok) throw new Error('Generation failed')
      const { id } = await res.json()
      router.push(`/history?id=${id}`)
    } catch (e) {
      alert('Error: ' + e.message)
      setGenerating(false)
    } finally {
      clearInterval(interval)
    }
  }

  async function handleImages(e) {
    const files = [...e.target.files]
    const compressed = await Promise.all(files.slice(0, 5-extraImages.length).map(compressImage))
    setExtraImages(prev => [...prev, ...compressed].slice(0,5))
    e.target.value = ''
  }

  if (generating) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:20, background:'#FFF8F3' }}>
      <div style={{ width:52, height:52, border:'4px solid rgba(255,92,53,0.15)', borderTopColor:'#FF5C35', borderRadius:'50%', animation:'spin .9s linear infinite' }}/>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#0f0e17' }}>PostMate is writing your content</div>
      <div style={{ fontSize:14, color:'#9a9090', fontWeight:300 }}>{loadMsg}</div>
      <div style={{ fontSize:12, color:'#9a9090', opacity:.6 }}>About 30–60 seconds</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding:40, maxWidth:680, animation:'fadeIn .4s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#0f0e17', marginBottom:6 }}>
        Generate {currentMonth} Content
      </h1>
      <p style={{ fontSize:14, color:'#9a9090', fontWeight:300, marginBottom:32 }}>Tell PostMate what's happening this month and click Generate. Everything else is automatic.</p>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:24, marginBottom:16 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:16 }}>What's happening in {currentMonth}?</div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:6 }}>Any promotions or offers?</label>
            <textarea style={{ width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', resize:'vertical', lineHeight:1.6, minHeight:60, fontFamily:'DM Sans,sans-serif' }} value={updates.promotions} onChange={e=>setUpdates(u=>({...u,promotions:e.target.value}))} placeholder="e.g. 20% off all colour treatments in January"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:6 }}>Any news?</label>
              <input style={{ width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', fontFamily:'DM Sans,sans-serif' }} value={updates.news} onChange={e=>setUpdates(u=>({...u,news:e.target.value}))} placeholder="e.g. New staff member joining"/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:6 }}>Services to highlight?</label>
              <input style={{ width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', fontFamily:'DM Sans,sans-serif' }} value={updates.highlights} onChange={e=>setUpdates(u=>({...u,highlights:e.target.value}))} placeholder="e.g. Gel nails, skin facials"/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:6 }}>Anything to avoid?</label>
            <input style={{ width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', fontFamily:'DM Sans,sans-serif' }} value={updates.avoid} onChange={e=>setUpdates(u=>({...u,avoid:e.target.value}))} placeholder="e.g. Don't mention the refurbishment yet"/>
          </div>
        </div>
      </div>

      {/* Extra images */}
      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:24, marginBottom:16 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:6 }}>Extra images this month</div>
        <p style={{ fontSize:12, color:'#9a9090', fontWeight:300, marginBottom:14 }}>Optional — seasonal photos, new products, anything specific to {currentMonth}.</p>
        {extraImages.length>0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            {extraImages.map((img,i)=>(
              <div key={i} style={{ position:'relative' }}>
                <img src={img.preview} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:4, border:'1px solid rgba(15,14,23,0.1)' }}/>
                <button onClick={()=>setExtraImages(p=>p.filter((_,j)=>j!==i))} style={{ position:'absolute', top:-6, right:-6, width:18, height:18, background:'#FF5C35', color:'white', borderRadius:'50%', border:'none', cursor:'pointer', fontSize:12 }}>×</button>
              </div>
            ))}
          </div>
        )}
        {extraImages.length<5 && (
          <div onClick={()=>fileRef.current.click()} style={{ border:'2px dashed rgba(255,92,53,0.2)', padding:'16px 20px', textAlign:'center', cursor:'pointer', background:'rgba(255,92,53,0.02)' }}>
            <div style={{ fontSize:13, color:'#9a9090' }}>+ Add images ({extraImages.length}/5)</div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImages}/>
          </div>
        )}
      </div>

      {/* Content type */}
      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:24, marginBottom:24 }}>
        <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:8 }}>Content Package</label>
        <select style={{ width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', cursor:'pointer', fontFamily:'DM Sans,sans-serif', appearance:'none' }} value={contentType} onChange={e=>setContentType(e.target.value)}>
          <option value="full">Full package — social, email, Google & blog</option>
          <option value="social">Social posts only (16 posts)</option>
          <option value="email">Email newsletters only</option>
          <option value="google">Google Business posts only</option>
          <option value="blog">Blog posts only</option>
        </select>
      </div>

      <button onClick={generate} style={{ width:'100%', background:'#FF5C35', color:'white', border:'none', padding:'18px', fontFamily:'DM Sans,sans-serif', fontSize:15, fontWeight:500, cursor:'pointer', borderRadius:100, display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'background .2s' }}>
        ⚡ Generate {currentMonth} Content
      </button>
    </div>
  )
}
