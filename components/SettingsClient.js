'use client'
import { useState, useRef } from 'react'

const VOICES = [
  {v:'friendly and warm',l:'Friendly & Warm',e:'😊'},
  {v:'professional and trustworthy',l:'Professional',e:'💼'},
  {v:'fun and energetic',l:'Fun & Energetic',e:'⚡'},
  {v:'luxury and premium',l:'Luxury',e:'✨'},
  {v:'casual and conversational',l:'Casual',e:'👋'},
]

async function compressImage(file) {
  return new Promise((res,rej) => {
    const img=new Image(), url=URL.createObjectURL(file)
    img.onload=()=>{
      const max=800,c=document.createElement('canvas')
      let w=img.width,h=img.height
      if(w>max||h>max){if(w>h){h=Math.round(h*max/w);w=max}else{w=Math.round(w*max/h);h=max}}
      c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h)
      URL.revokeObjectURL(url)
      res({data:c.toDataURL('image/jpeg',.72).split(',')[1],type:'image/jpeg',preview:c.toDataURL('image/jpeg',.4),name:file.name})
    }
    img.onerror=()=>rej(new Error('Failed'));img.src=url
  })
}

export default function SettingsClient({ profile }) {
  const [form,setForm] = useState({
    business_name:profile?.business_name||'', business_type:profile?.business_type||'',
    location:profile?.location||'', website:profile?.website||'',
    offerings:profile?.offerings||'', audience:profile?.audience||'',
    voice:profile?.voice||'friendly and warm', instagram:profile?.instagram||'',
    facebook:profile?.facebook||'', images:profile?.images||[],
  })
  const [saving,setSaving] = useState(false)
  const [saved,setSaved] = useState(false)
  const imgRef = useRef()
  const s = (k,v) => setForm(f=>({...f,[k]:v}))
  const inp = { width:'100%', padding:'12px 14px', border:'1.5px solid rgba(15,14,23,0.12)', background:'#FFF8F3', fontSize:14, outline:'none', color:'#0f0e17', fontFamily:'DM Sans,sans-serif' }
  const lbl = { fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#0f0e17', display:'block', marginBottom:6 }

  async function handleImgs(e) {
    const files=[...e.target.files]
    const compressed=await Promise.all(files.slice(0,5-form.images.length).map(compressImage))
    s('images',[...form.images,...compressed].slice(0,5))
    e.target.value=''
  }

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/profile',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      setSaved(true); setTimeout(()=>setSaved(false),2500)
    } catch(e) { alert('Error: '+e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding:36, maxWidth:640, fontFamily:'DM Sans,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#0f0e17', marginBottom:4 }}>Settings</h1>
      <p style={{ fontSize:13, color:'#9a9090', marginBottom:28 }}>Update your profile. Changes apply to your next generation.</p>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:22, marginBottom:14 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:14 }}>Business Details</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['Business Name','business_name'],['Type','business_type'],['Location','location'],['Website','website']].map(([l,k])=>(
            <div key={k}><label style={lbl}>{l}</label><input style={inp} value={form[k]} onChange={e=>s(k,e.target.value)}/></div>
          ))}
        </div>
        <div style={{ marginTop:12 }}><label style={lbl}>What You Offer</label><textarea style={{ ...inp, minHeight:80, resize:'vertical', lineHeight:1.6 }} value={form.offerings} onChange={e=>s('offerings',e.target.value)}/></div>
        <div style={{ marginTop:12 }}><label style={lbl}>Your Customers</label><textarea style={{ ...inp, minHeight:64, resize:'vertical', lineHeight:1.6 }} value={form.audience} onChange={e=>s('audience',e.target.value)}/></div>
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['Instagram','instagram'],['Facebook','facebook']].map(([l,k])=>(
            <div key={k}><label style={lbl}>{l}</label><input style={inp} value={form[k]} onChange={e=>s(k,e.target.value)}/></div>
          ))}
        </div>
      </div>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:22, marginBottom:14 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:12 }}>Brand Voice</div>
        {VOICES.map(v=>(
          <div key={v.v} onClick={()=>s('voice',v.v)} style={{ padding:'11px 14px', border:`2px solid ${form.voice===v.v?'#FF5C35':'rgba(15,14,23,0.1)'}`, background:form.voice===v.v?'rgba(255,92,53,0.04)':'white', cursor:'pointer', display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <span style={{ fontSize:16 }}>{v.e}</span>
            <span style={{ fontSize:13, fontWeight:form.voice===v.v?500:400, color:'#0f0e17' }}>{v.l}</span>
            {form.voice===v.v && <div style={{ marginLeft:'auto', width:16, height:16, borderRadius:'50%', background:'#FF5C35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'white' }}>✓</div>}
          </div>
        ))}
      </div>

      <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:22, marginBottom:22 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#0f0e17', marginBottom:6 }}>Brand Images</div>
        <p style={{ fontSize:12, color:'#9a9090', marginBottom:14 }}>Logo and product photos sent to AI with every generation. Up to 5.</p>
        {form.images.length>0 && <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {form.images.map((img,i)=>(
            <div key={i} style={{ position:'relative' }}>
              <img src={img.preview} alt="" style={{ width:76, height:76, objectFit:'cover', borderRadius:4, border:'1px solid rgba(15,14,23,0.1)' }}/>
              <button onClick={()=>s('images',form.images.filter((_,j)=>j!==i))} style={{ position:'absolute', top:-5, right:-5, width:18, height:18, background:'#FF5C35', color:'white', borderRadius:'50%', border:'none', cursor:'pointer', fontSize:12 }}>×</button>
            </div>
          ))}
        </div>}
        {form.images.length<5 && <div onClick={()=>imgRef.current.click()} style={{ border:'2px dashed rgba(255,92,53,0.2)', padding:'16px', textAlign:'center', cursor:'pointer' }}>
          <div style={{ fontSize:13, color:'#9a9090' }}>+ Add images ({form.images.length}/5)</div>
          <input ref={imgRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImgs}/>
        </div>}
      </div>

      <button onClick={save} disabled={saving} style={{ background:saved?'#22c55e':'#FF5C35', color:'white', border:'none', padding:'14px 36px', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500, cursor:'pointer', borderRadius:100, transition:'background .3s' }}>
        {saved?'✓ Saved!':(saving?'Saving…':'Save Changes')}
      </button>
    </div>
  )
}
