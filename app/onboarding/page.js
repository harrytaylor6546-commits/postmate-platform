'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const VOICES = [
  { v: 'friendly and warm', l: 'Friendly & Warm', e: '😊', d: 'Approachable, personal, like a friend' },
  { v: 'professional and trustworthy', l: 'Professional', e: '💼', d: 'Polished, credible, expert' },
  { v: 'fun and energetic', l: 'Fun & Energetic', e: '⚡', d: 'Upbeat, enthusiastic, full of life' },
  { v: 'luxury and premium', l: 'Luxury', e: '✨', d: 'Elegant, refined, aspirational' },
  { v: 'casual and conversational', l: 'Casual', e: '👋', d: 'Relaxed, down-to-earth' },
]

const STEPS = [
  { label: 'Business', title: 'Your business', sub: "This is the foundation of everything PostMate creates." },
  { label: 'Customers', title: 'Your customers', sub: "The more specific you are, the better PostMate writes." },
  { label: 'Services', title: 'What you offer', sub: "List everything — services, products, specialities." },
  { label: 'Voice', title: 'Your brand voice', sub: "PostMate writes in this style consistently." },
  { label: 'Socials', title: 'Social accounts', sub: "Helps PostMate reference your handles in content." },
  { label: 'Images', title: 'Brand images', sub: "Your logo and product photos, used in content and image generation." },
]

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 900, c = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w = max } else { w = Math.round(w*max/h); h = max } }
      c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve({ data: c.toDataURL('image/jpeg', .72).split(',')[1], type: 'image/jpeg', preview: c.toDataURL('image/jpeg', .4), name: file.name })
    }
    img.onerror = () => reject(new Error('Failed')); img.src = url
  })
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', type: '', location: '', website: '', audience: '', offerings: '', voice: 'friendly and warm', instagram: '', facebook: '', images: [] })
  const imgRef = useRef()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function next() {
    if (step === 1 && (!form.name || !form.type || !form.location)) { alert('Please fill in name, type and location.'); return }
    if (step === 3 && !form.offerings) { alert('Please describe what you offer.'); return }
    if (step < 6) setStep(s => s + 1)
    else finish()
  }

  async function finish() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, onboarding_complete: true }) })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/dashboard')
    } catch (e) { alert('Error: ' + e.message); setSaving(false) }
  }

  async function handleImages(e) {
    const files = [...e.target.files]
    const compressed = await Promise.all(files.slice(0, 5 - form.images.length).map(compressImage))
    set('images', [...form.images, ...compressed].slice(0, 5))
    e.target.value = ''
  }

  const current = STEPS[step - 1]
  const progress = (step / 6) * 100

  const inpStyle = { width: '100%', padding: '13px 16px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', fontSize: 14, fontWeight: 300, outline: 'none', color: 'white', borderRadius: 4, fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s' }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E17', display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} input,textarea,select{font-family:'DM Sans',sans-serif;} input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.25);} input:focus,textarea:focus{border-color:#FF5C35!important;} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} .slide{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}`}</style>

      {/* Left panel — progress */}
      <div style={{ width: 280, background: '#0A0914', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '48px 32px', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{ width: 30, height: 30, background: '#FF5C35', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif' }}>P</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white' }}>PostMate</span>
        </div>

        {/* Steps */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 20 }}>Setup</div>
          {STEPS.map((s, i) => {
            const done = i + 1 < step
            const active = i + 1 === step
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, opacity: i + 1 > step ? 0.3 : 1, transition: 'opacity .3s' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#22c55e' : active ? '#FF5C35' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0, transition: 'all .3s' }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, color: active ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: active ? 500 : 300 }}>{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#FF5C35', width: progress + '%', transition: 'width .4s cubic-bezier(.22,1,.36,1)', borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>Step {step} of 6</div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Step header */}
          <div className="slide" key={step + '-header'} style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1.5, background: '#FF5C35', display: 'inline-block' }} />
              Step {step}
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, lineHeight: 1.15 }}>{current.title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: 1.6 }}>{current.sub}</p>
          </div>

          {/* Fields */}
          <div className="slide" key={step + '-fields'} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>

            {step === 1 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>Business Name *</label>
                    <input style={inpStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. The Rusty Anchor" autoFocus />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>Type *</label>
                    <input style={inpStyle} value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Traditional pub" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>Location *</label>
                  <input style={inpStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Leeds, West Yorkshire" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>Website</label>
                  <input style={inpStyle} value={form.website} onChange={e => set('website', e.target.value)} placeholder="yourwebsite.co.uk" />
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>Describe your ideal customer</label>
                <textarea style={{ ...inpStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.65 }} value={form.audience} onChange={e => set('audience', e.target.value)} placeholder="e.g. Local residents aged 25-55 who want quality food and real ale in a relaxed setting. Regulars who value community and a proper pub atmosphere." />
              </div>
            )}

            {step === 3 && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>Products & Services *</label>
                <textarea style={{ ...inpStyle, minHeight: 160, resize: 'vertical', lineHeight: 1.65 }} value={form.offerings} onChange={e => set('offerings', e.target.value)} placeholder="e.g. Cask ales, craft beers, home-cooked pub food, Sunday roasts, private dining for events, quiz nights Wednesdays, live music Fridays..." />
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {VOICES.map(v => (
                  <div key={v.v} onClick={() => set('voice', v.v)} style={{ padding: '14px 16px', border: '1.5px solid ' + (form.voice === v.v ? '#FF5C35' : 'rgba(255,255,255,0.07)'), background: form.voice === v.v ? 'rgba(255,92,53,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 6, transition: 'all .15s' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: form.voice === v.v ? 'rgba(255,92,53,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{v.e}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>{v.l}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{v.d}</div>
                    </div>
                    {form.voice === v.v && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#FF5C35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', flexShrink: 0 }}>✓</div>}
                  </div>
                ))}
              </div>
            )}

            {step === 5 && (
              <>
                {[['Instagram Handle', 'instagram', '@yourhandle'], ['Facebook Page', 'facebook', 'Your Business Name']].map(([l, k, ph]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 7 }}>{l}</label>
                    <input style={inpStyle} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} />
                  </div>
                ))}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', lineHeight: 1.55 }}>Optional — you can skip this and add them in settings later.</p>
              </>
            )}

            {step === 6 && (
              <>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img.preview} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button onClick={() => set('images', form.images.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#FF5C35', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 13 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length < 5 && (
                  <div onClick={() => imgRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 6, padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'border-color .15s' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Upload logo & product photos</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>PNG, JPG or WEBP &middot; Up to 5 &middot; Auto-compressed</div>
                    <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
                  </div>
                )}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', lineHeight: 1.55 }}>You can skip this and add images in settings later.</p>
              </>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => step > 1 ? setStep(s => s - 1) : null} style={{ padding: '12px 22px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: step > 1 ? 'pointer' : 'default', borderRadius: 100, color: step > 1 ? 'rgba(255,255,255,0.5)' : 'transparent', transition: 'all .2s' }}>
              ← Back
            </button>
            <button onClick={next} disabled={saving} style={{ padding: '13px 36px', background: saving ? '#22c55e' : '#FF5C35', color: 'white', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 100, transition: 'all .2s', letterSpacing: '0.01em' }}>
              {saving ? 'Setting up...' : step === 6 ? 'Go to Dashboard →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
