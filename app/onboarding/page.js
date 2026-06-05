'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const VOICES = [
  { value:'friendly and warm', label:'Friendly & Warm', emoji:'😊', desc:'Approachable, personal, like talking to a friend' },
  { value:'professional and trustworthy', label:'Professional', emoji:'💼', desc:'Polished, credible, expert in your field' },
  { value:'fun and energetic', label:'Fun & Energetic', emoji:'⚡', desc:'Upbeat, enthusiastic, full of personality' },
  { value:'luxury and premium', label:'Luxury', emoji:'✨', desc:'Elegant, refined, aspirational' },
  { value:'casual and conversational', label:'Casual', emoji:'👋', desc:'Relaxed, down-to-earth, no-frills' },
]

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 900, c = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w=max } else { w=Math.round(w*max/h); h=max } }
      c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h)
      URL.revokeObjectURL(url)
      resolve({ data:c.toDataURL('image/jpeg',.72).split(',')[1], type:'image/jpeg', preview:c.toDataURL('image/jpeg',.4), name:file.name })
    }
    img.onerror = () => reject(new Error('Failed')); img.src = url
  })
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', type:'', location:'', website:'', audience:'', offerings:'', voice:'friendly and warm', instagram:'', facebook:'', images:[] })
  const imgRef = useRef()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const STEPS = ['Business','Customers','Services','Voice','Socials','Images']

  function next() {
    if (step===1 && (!form.name||!form.type||!form.location)) { alert('Please fill in name, type and location.'); return }
    if (step===3 && !form.offerings) { alert('Please describe what you offer.'); return }
    if (step < 6) setStep(s=>s+1)
    else finish()
  }

  async function finish() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, onboarding_complete: true })
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/dashboard')
    } catch(e) { alert('Error: ' + e.message); setSaving(false) }
  }

  async function handleImages(e) {
    const files = [...e.target.files]
    const compressed = await Promise.all(files.slice(0, 5-form.images.length).map(compressImage))
    set('images', [...form.images, ...compressed].slice(0,5))
    e.target.value = ''
  }

  const inpStyle = { width:'100%', padding:'13px 14px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, outline:'none', color:'white', fontFamily:'DM Sans,sans-serif' }
  const lblStyle = { fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', display:'block', marginBottom:6 }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0e17', fontFamily:'DM Sans,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ padding:'0 28px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, background:'#FF5C35', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>P</div>
          PostMate
        </div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'.1em', textTransform:'uppercase' }}>Setup {step}/6</div>
      </div>

      <div style={{ height:3, background:'rgba(255,255,255,0.06)' }}>
        <div style={{ height:'100%', background:'#FF5C35', width:`${(step/6)*100}%`, transition:'width .4s' }}/>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ display:'flex', justifyContent:'center', gap:5, marginBottom:32 }}>
          {STEPS.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:i+1<=step?'#FF5C35':'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:i+1<=step?'white':'rgba(255,255,255,0.3)' }}>{i+1<step?'✓':i+1}</div>
              {i<STEPS.length-1 && <div style={{ width:14, height:2, background:i+1<step?'#FF5C35':'rgba(255,255,255,0.08)' }}/>}
            </div>
          ))}
        </div>

        {step===1 && <div style={{ animation:'fi .4s ease' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'white', marginBottom:6 }}>Your business</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>The foundation of everything PostMate creates.</p>
          {[['Business Name *','name','e.g. The Rusty Anchor'],['Type *','type','e.g. Traditional pub, Hair salon'],['Location *','location','e.g. Leeds, UK'],['Website','website','yoursite.co.uk']].map(([l,k,ph])=>(
            <div key={k} style={{ marginBottom:14 }}>
              <label style={lblStyle}>{l}</label>
              <input style={inpStyle} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}/>
            </div>
          ))}
        </div>}

        {step===2 && <div style={{ animation:'fi .4s ease' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'white', marginBottom:6 }}>Your customers</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Who are they? Be specific.</p>
          <label style={lblStyle}>Describe your ideal customer</label>
          <textarea style={{ ...inpStyle, minHeight:120, resize:'vertical', lineHeight:1.65 }} value={form.audience} onChange={e=>set('audience',e.target.value)} placeholder="e.g. Local residents aged 25–55 who want quality food and real ale..."/>
        </div>}

        {step===3 && <div style={{ animation:'fi .4s ease' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'white', marginBottom:6 }}>What you offer</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>List everything — food, drinks, events, services.</p>
          <label style={lblStyle}>Products & Services *</label>
          <textarea style={{ ...inpStyle, minHeight:140, resize:'vertical', lineHeight:1.65 }} value={form.offerings} onChange={e=>set('offerings',e.target.value)} placeholder="e.g. Cask ales, home-cooked pub food, Sunday roasts, quiz nights..."/>
        </div>}

        {step===4 && <div style={{ animation:'fi .4s ease' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'white', marginBottom:6 }}>Brand voice</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>How does your brand sound?</p>
          {VOICES.map(v=>(
            <div key={v.value} onClick={()=>set('voice',v.value)} style={{ padding:'14px 16px', border:`2px solid ${form.voice===v.value?'#FF5C35':'rgba(255,255,255,0.08)'}`, background:form.voice===v.value?'rgba(255,92,53,0.08)':'rgba(255,255,255,0.02)', cursor:'pointer', display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <span style={{ fontSize:18 }}>{v.emoji}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'white' }}>{v.label}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{v.desc}</div>
              </div>
              {form.voice===v.value && <div style={{ marginLeft:'auto', width:18, height:18, borderRadius:'50%', background:'#FF5C35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white' }}>✓</div>}
            </div>
          ))}
        </div>}

        {step===5 && <div style={{ animation:'fi .4s ease' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'white', marginBottom:6 }}>Social accounts</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Optional — helps PostMate reference your handles.</p>
          {[['Instagram','instagram','@yourhandle'],['Facebook','facebook','Your Business Name']].map(([l,k,ph])=>(
            <div key={k} style={{ marginBottom:14 }}>
              <label style={lblStyle}>{l}</label>
              <input style={inpStyle} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}/>
            </div>
          ))}
        </div>}

        {step===6 && <div style={{ animation:'fi .4s ease' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'white', marginBottom:6 }}>Brand images</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Upload your logo and product photos. PostMate references these when writing your content.</p>
          {form.images.length>0 && (
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:14 }}>
              {form.images.map((img,i)=>(
                <div key={i} style={{ position:'relative' }}>
                  <img src={img.preview} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:4, border:'1px solid rgba(255,255,255,0.1)' }}/>
                  <button onClick={()=>set('images',form.images.filter((_,j)=>j!==i))} style={{ position:'absolute', top:-6, right:-6, width:20, height:20, background:'#FF5C35', color:'white', borderRadius:'50%', border:'none', cursor:'pointer', fontSize:13 }}>×</button>
                </div>
              ))}
            </div>
          )}
          {form.images.length<5 && (
            <div onClick={()=>imgRef.current.click()} style={{ border:'2px dashed rgba(255,92,53,0.3)', padding:'28px', textAlign:'center', cursor:'pointer', background:'rgba(255,92,53,0.03)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🖼️</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Upload logo & product photos ({form.images.length}/5)</div>
              <input ref={imgRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImages}/>
            </div>
          )}
        </div>}

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:28 }}>
          <button onClick={()=>step>1?setStep(s=>s-1):null} style={{ padding:'12px 22px', background:'transparent', border:'1.5px solid rgba(255,255,255,0.1)', fontFamily:'DM Sans,sans-serif', fontSize:13, cursor:step>1?'pointer':'default', borderRadius:100, color:step>1?'rgba(255,255,255,0.6)':'transparent' }}>← Back</button>
          <button onClick={next} disabled={saving} style={{ padding:'13px 32px', background:'#FF5C35', color:'white', border:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500, cursor:'pointer', borderRadius:100 }}>
            {saving?'Saving…':step===6?'🚀 Go to Dashboard':'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
