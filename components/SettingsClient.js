'use client'
import { useState, useRef } from 'react'

const VOICES = [
  { value:'friendly and warm', label:'Friendly & Warm', emoji:'😊' },
  { value:'professional and trustworthy', label:'Professional', emoji:'💼' },
  { value:'fun and energetic', label:'Fun & Energetic', emoji:'⚡' },
  { value:'luxury and premium', label:'Luxury', emoji:'✨' },
  { value:'casual and conversational', label:'Casual', emoji:'👋' },
]

async function compressImage(file) {
  return new Promise((resolve,reject) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const max=800, c=document.createElement('canvas')
      let w=img.width, h=img.height
      if(w>max||h>max){if(w>h){h=Math.round(h*max/w);w=max}else{w=Math.round(w*max/h);h=max}}
      c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h)
      URL.revokeObjectURL(url)
      resolve({data:c.toDataURL('image/jpeg',.72).split(',')[1],type:'image/jpeg',preview:c.toDataURL('image/jpeg',.4),name:file.name})
    }
    img.onerror=()=>reject(new Error('Failed'));img.src=url
  })
}

export default function SettingsClient({ profile }) {
  const [form, setForm] = useState({
    business_name: profile?.business_name||'',
    business_type: profile?.business_type||'',
    location: profile?.location||'',
    website: profile?.website||'',
    offerings: profile?.offerings||'',
    audience: profile?.audience||'',
    voice: profile?.voice||'friendly and warm',
    instagram: profile?.instagram||'',
    facebook: profile?.facebook||'',
    images: profile?.images||[],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const imgRef = useRef()
  const s = (k,v) => setForm(f=>({...f,[k]:v}))
  const lbl = { fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:6 }
  const inp = { width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', fontFamily:'DM Sans,sans-serif', transition:'border-color .2s' }

  async function handleImages(e) {
    const files=[...e.target.files]
    const compressed=await Promise.all(files.slice(0,5-form.images.length).map(compressImage))
    s('images',[...form.images,...compressed].slice(0,5))
    e.target.value=''
  }

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      })
      setSaved(true)
      setTimeout(()=>setSaved(false),2500)
    } catch(e){ alert('Error saving: '+e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding:40, maxWidth:680 }}>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#0f0e17', marginBottom:6 }}>Profile Settings</h1>
      <p style={{ fontSize:14, color:'#9a9090', fontWeight:300, marginBottom:32 }}>Update your business details. Changes apply to your next content generation.</p>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:24, marginBottom:16 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:16 }}>Business Details</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div><label style={lbl}>Business Name</label><input style={inp} value={form.business_name} onChange={e=>s('business_name',e.target.value)}/></div>
          <div><label style={lbl}>Business Type</label><input style={inp} value={form.business_type} onChange={e=>s('business_type',e.target.value)}/></div>
          <div><label style={lbl}>Location</label><input style={inp} value={form.location} onChange={e=>s('location',e.target.value)}/></div>
          <div><label style={lbl}>Website</label><input style={inp} value={form.website} onChange={e=>s('website',e.target.value)}/></div>
        </div>
        <div style={{ marginTop:14 }}><label style={lbl}>What You Offer</label><textarea style={{ ...inp, resize:'vertical', lineHeight:1.6, minHeight:80 }} value={form.offerings} onChange={e=>s('offerings',e.target.value)}/></div>
        <div style={{ marginTop:14 }}><label style={lbl}>Your Customers</label><textarea style={{ ...inp, resize:'vertical', lineHeight:1.6, minHeight:64 }} value={form.audience} onChange={e=>s('audience',e.target.value)}/></div>
        <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={e=>s('instagram',e.target.value)}/></div>
          <div><label style={lbl}>Facebook</label><input style={inp} value={form.facebook} onChange={e=>s('facebook',e.target.value)}/></div>
        </div>
      </div>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:24, marginBottom:16 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:14 }}>Brand Voice</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {VOICES.map(v=>(
            <div key={v.value} onClick={()=>s('voice',v.value)} style={{ padding:'12px 16px', border:`2px solid ${form.voice===v.value?'#FF5C35':'rgba(15,14,23,0.1)'}`, background:form.voice===v.value?'rgba(255,92,53,0.04)':'white', cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all .15s' }}>
              <span style={{ fontSize:18 }}>{v.emoji}</span>
              <span style={{ fontSize:13, fontWeight:form.voice===v.value?500:400, color:'#0f0e17' }}>{v.label}</span>
              {form.voice===v.value&&<div style={{ marginLeft:'auto', width:18, height:18, borderRadius:'50%', background:'#FF5C35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white' }}>✓</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:24, marginBottom:24 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:6 }}>Brand Images</div>
        <p style={{ fontSize:12, color:'#9a9090', fontWeight:300, marginBottom:14 }}>Logo and product photos sent to AI with every content request. Up to 5 images.</p>
        {form.images.length>0&&(
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            {form.images.map((img,i)=>(
              <div key={i} style={{ position:'relative' }}>
                <img src={img.preview} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:4, border:'1px solid rgba(15,14,23,0.1)' }}/>
                <button onClick={()=>s('images',form.images.filter((_,j)=>j!==i))} style={{ position:'absolute', top:-6, right:-6, width:20, height:20, background:'#FF5C35', color:'white', borderRadius:'50%', border:'none', cursor:'pointer', fontSize:13 }}>×</button>
              </div>
            ))}
          </div>
        )}
        {form.images.length<5&&(
          <div onClick={()=>imgRef.current.click()} style={{ border:'2px dashed rgba(255,92,53,0.2)', padding:'18px', textAlign:'center', cursor:'pointer', background:'rgba(255,92,53,0.02)' }}>
            <div style={{ fontSize:13, color:'#9a9090' }}>+ Add images ({form.images.length}/5)</div>
            <input ref={imgRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImages}/>
          </div>
        )}
      </div>

      <button onClick={save} disabled={saving} style={{ background:saved?'#22c55e':'#FF5C35', color:'white', border:'none', padding:'14px 36px', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500, cursor:'pointer', borderRadius:100, transition:'background .3s', opacity:saving?.7:1 }}>
        {saved?'✓ Saved!':(saving?'Saving…':'Save Changes')}
      </button>
    </div>
  )
}
