'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const VOICES = [
  { value: 'friendly and warm', label: 'Friendly & Warm', emoji: '😊', desc: 'Approachable, personal, like talking to a friend' },
  { value: 'professional and trustworthy', label: 'Professional', emoji: '💼', desc: 'Polished, credible, expert in your field' },
  { value: 'fun and energetic', label: 'Fun & Energetic', emoji: '⚡', desc: 'Upbeat, enthusiastic, full of personality' },
  { value: 'luxury and premium', label: 'Luxury', emoji: '✨', desc: 'Elegant, refined, aspirational' },
  { value: 'casual and conversational', label: 'Casual', emoji: '👋', desc: 'Relaxed, down-to-earth, no-frills' },
]

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 900, c = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w=max } else { w=Math.round(w*max/h); h=max } }
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve({ data: c.toDataURL('image/jpeg',0.72).split(',')[1], type:'image/jpeg', preview:c.toDataURL('image/jpeg',0.4), name:file.name })
    }
    img.onerror = () => reject(new Error('Failed to load'))
    img.src = url
  })
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', type:'', location:'', website:'', audience:'', offerings:'', voice:'friendly and warm', instagram:'', facebook:'', images:[] })
  const imgRef = useRef()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const STEPS = ['Business','Customers','Services','Voice','Socials','Brand Images']

  function next() {
    if (step===1 && (!form.name||!form.type||!form.location)) { alert('Please fill in business name, type and location.'); return }
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
    } catch (e) {
      alert('Error saving profile: ' + e.message)
      setSaving(false)
    }
  }

  async function handleImages(e) {
    const files = [...e.target.files]
    const compressed = await Promise.all(files.slice(0, 5-form.images.length).map(compressImage))
    set('images', [...form.images, ...compressed].slice(0,5))
    e.target.value = ''
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0e17', fontFamily:'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, background:'#FF5C35', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800 }}>P</div>
          PostMate
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:'.1em', textTransform:'uppercase' }}>Setup · {step} of 6</div>
      </div>

      {/* Progress */}
      <div style={{ height:3, background:'rgba(255,255,255,0.06)' }}>
        <div style={{ height:'100%', background:'#FF5C35', width:`${(step/6)*100}%`, transition:'width .4s ease' }}/>
      </div>

      <div style={{ maxWidth:540, margin:'0 auto', padding:'48px 24px' }}>
        {/* Step dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:40 }}>
          {STEPS.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background: i+1<=step ? '#FF5C35' : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color: i+1<=step ? 'white' : 'rgba(255,255,255,0.3)', transition:'all .3s' }}>
                {i+1<step ? '✓' : i+1}
              </div>
              {i<STEPS.length-1 && <div style={{ width:16, height:2, background: i+1<step ? '#FF5C35' : 'rgba(255,255,255,0.08)', transition:'all .3s' }}/>}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step===1 && (
          <div className="fade-in">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', marginBottom:8 }}>Tell us about your business</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:300, lineHeight:1.7, marginBottom:28 }}>This is the foundation of everything PostMate creates for you.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['Business Name *','name','e.g. The Blossom Hair Studio'],['Type of Business *','type','e.g. Hair salon, Restaurant, Plumber'],['Location *','location','e.g. Manchester, UK'],['Website (optional)','website','yourwebsite.co.uk']].map(([lbl,key,ph])=>(
                <div key={key}>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>{lbl}</label>
                  <input style={{ width:'100%', padding:'13px 14px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, outline:'none', color:'white' }} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div className="fade-in">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', marginBottom:8 }}>Who are your customers?</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:300, lineHeight:1.7, marginBottom:28 }}>The more specific you are, the better PostMate writes for your audience.</p>
            <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>Describe your ideal customer</label>
            <textarea style={{ width:'100%', padding:'13px 14px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, outline:'none', color:'white', resize:'vertical', lineHeight:1.65, minHeight:130 }} value={form.audience} onChange={e=>set('audience',e.target.value)} placeholder="e.g. Women aged 25–45 in Manchester who value quality and self-care. Busy professionals willing to invest in their appearance."/>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div className="fade-in">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', marginBottom:8 }}>What do you offer?</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:300, lineHeight:1.7, marginBottom:28 }}>List everything — services, products, specialities, price ranges.</p>
            <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>Your Products & Services *</label>
            <textarea style={{ width:'100%', padding:'13px 14px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, outline:'none', color:'white', resize:'vertical', lineHeight:1.65, minHeight:150 }} value={form.offerings} onChange={e=>set('offerings',e.target.value)} placeholder="e.g. Haircuts from £35, balayage from £120, colour correction, skin treatments, gel nails. Specialise in lived-in colour and balayage techniques."/>
          </div>
        )}

        {/* Step 4 - Voice */}
        {step===4 && (
          <div className="fade-in">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', marginBottom:8 }}>How does your brand sound?</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:300, lineHeight:1.7, marginBottom:28 }}>PostMate will write in this voice consistently across all your content.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {VOICES.map(v=>(
                <div key={v.value} onClick={()=>set('voice',v.value)} style={{ padding:'16px 18px', border:`2px solid ${form.voice===v.value ? '#FF5C35' : 'rgba(255,255,255,0.08)'}`, background: form.voice===v.value ? 'rgba(255,92,53,0.08)' : 'rgba(255,255,255,0.02)', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all .15s' }}>
                  <div style={{ width:38, height:38, background: form.voice===v.value ? 'rgba(255,92,53,0.15)' : 'rgba(255,255,255,0.06)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{v.emoji}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'white' }}>{v.label}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:300, marginTop:2 }}>{v.desc}</div>
                  </div>
                  {form.voice===v.value && <div style={{ marginLeft:'auto', width:20, height:20, borderRadius:'50%', background:'#FF5C35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'white' }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step===5 && (
          <div className="fade-in">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', marginBottom:8 }}>Your social accounts</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:300, lineHeight:1.7, marginBottom:28 }}>Optional — helps PostMate reference your handles in content.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['Instagram Handle','instagram','@yourhandle'],['Facebook Page','facebook','Your Business Name']].map(([lbl,key,ph])=>(
                <div key={key}>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>{lbl}</label>
                  <input style={{ width:'100%', padding:'13px 14px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, outline:'none', color:'white' }} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 - Images */}
        {step===6 && (
          <div className="fade-in">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', marginBottom:8 }}>Add your brand images</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:300, lineHeight:1.7, marginBottom:28 }}>Upload your logo and product photos. PostMate references these when writing content to make it genuinely yours. Up to 5 images.</p>
            {form.images.length>0 && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
                {form.images.map((img,i)=>(
                  <div key={i} style={{ position:'relative' }}>
                    <img src={img.preview} alt={img.name} style={{ width:84, height:84, objectFit:'cover', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)' }}/>
                    <button onClick={()=>set('images',form.images.filter((_,j)=>j!==i))} style={{ position:'absolute', top:-6, right:-6, width:20, height:20, background:'#FF5C35', color:'white', borderRadius:'50%', border:'none', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:3, maxWidth:84, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{img.name}</div>
                  </div>
                ))}
              </div>
            )}
            {form.images.length<5 && (
              <div onClick={()=>imgRef.current.click()} style={{ border:'2px dashed rgba(255,92,53,0.3)', padding:'36px', textAlign:'center', cursor:'pointer', background:'rgba(255,92,53,0.03)', borderRadius:4 }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🖼️</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)', fontWeight:400, marginBottom:4 }}>Upload logo & product images</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>PNG, JPG or WEBP · Up to 5 · Auto-compressed</div>
                <input ref={imgRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImages}/>
              </div>
            )}
            <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:300 }}>
              You can skip this for now and add images from your settings later.
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:36 }}>
          <button onClick={()=>step>1?setStep(s=>s-1):null} style={{ padding:'12px 22px', background:'transparent', border:'1.5px solid rgba(255,255,255,0.1)', fontFamily:'DM Sans,sans-serif', fontSize:13, cursor:step>1?'pointer':'default', borderRadius:100, color:step>1?'rgba(255,255,255,0.7)':'transparent', transition:'all .2s' }}>← Back</button>
          <button onClick={next} disabled={saving} style={{ padding:'13px 32px', background:saving?'#22c55e':'#FF5C35', color:'white', border:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500, cursor:'pointer', borderRadius:100, transition:'background .2s', opacity:saving?.7:1 }}>
            {saving ? 'Saving…' : step===6 ? '🚀 Go to Dashboard' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
