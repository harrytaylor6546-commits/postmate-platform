'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 800, c = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w = max } else { w = Math.round(w*max/h); h = max } }
      c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve({ data: c.toDataURL('image/jpeg', .7).split(',')[1], type: 'image/jpeg', preview: c.toDataURL('image/jpeg', .35), name: file.name })
    }
    img.onerror = () => reject(new Error('Failed')); img.src = url
  })
}

export default function GeneratePage() {
  const router = useRouter()
  const now = new Date()
  const currentMonth = MONTHS[now.getMonth()]
  const currentYear = now.getFullYear()
  const [updates, setUpdates] = useState({ promotions: '', news: '', highlights: '', avoid: '' })
  const [contentType, setContentType] = useState('full')
  const [extraImages, setExtraImages] = useState([])
  const [generating, setGenerating] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [loadStep, setLoadStep] = useState(0)
  const fileRef = useRef()
  const upd = (k, v) => setUpdates(u => ({ ...u, [k]: v }))

  const STEPS = ['Reading your profile', 'Writing social posts', 'Crafting newsletters', 'Building Google posts', 'Drafting blog content', 'Finishing up']

  async function generate() {
    setGenerating(true); setLoadStep(0); setLoadMsg(STEPS[0])
    const iv = setInterval(() => setLoadStep(s => { const n = Math.min(s+1, STEPS.length-1); setLoadMsg(STEPS[n]); return n }), 8000)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, contentType, extraImages, month: currentMonth, year: currentYear })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Generation failed')
      router.push('/history?id=' + result.id)
    } catch (e) { alert('Error: ' + e.message); setGenerating(false) }
    finally { clearInterval(iv) }
  }

  async function handleImages(e) {
    const files = [...e.target.files]
    const compressed = await Promise.all(files.slice(0, 5-extraImages.length).map(compressImage))
    setExtraImages(p => [...p, ...compressed].slice(0, 5))
    e.target.value = ''
  }

  if (generating) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F0E17', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, border: '3px solid rgba(255,92,53,0.15)', borderTopColor: '#FF5C35', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 28px' }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 10 }}>Creating your content</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: 32 }}>{loadMsg}...</p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === loadStep ? 24 : 6, height: 6, borderRadius: 3, background: i <= loadStep ? '#FF5C35' : 'rgba(255,255,255,0.1)', transition: 'all .4s' }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F6', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} .fade{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both} input,textarea,select{font-family:'DM Sans',sans-serif;}`}</style>

      <div style={{ padding: '48px', maxWidth: 680 }}>

        {/* Page header */}
        <div className="fade" style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 1.5, background: '#FF5C35', display: 'inline-block' }} />
            {currentMonth} {currentYear}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#0F0E17', marginBottom: 8 }}>Generate content</h1>
          <p style={{ fontSize: 15, color: '#6B6566', fontWeight: 300 }}>Tell PostMate what's happening this month. Everything else is handled automatically.</p>
        </div>

        {/* Updates section */}
        <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.07)', borderRadius: 10, padding: '28px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ADA8A6', marginBottom: 20 }}>This month's updates</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6566', display: 'block', marginBottom: 7 }}>Promotions & offers</label>
              <textarea style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(15,14,23,0.1)', background: '#F9F8F6', fontSize: 14, outline: 'none', color: '#0F0E17', resize: 'vertical', lineHeight: 1.6, minHeight: 68, borderRadius: 4 }}
                value={updates.promotions}
                onChange={e => upd('promotions', e.target.value)}
                placeholder="e.g. 20% off all services this month, new product launch, seasonal offer..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6566', display: 'block', marginBottom: 7 }}>News or milestones</label>
                <input style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(15,14,23,0.1)', background: '#F9F8F6', fontSize: 14, outline: 'none', color: '#0F0E17', borderRadius: 4 }}
                  value={updates.news} onChange={e => upd('news', e.target.value)} placeholder="New staff, award, anniversary..." />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6566', display: 'block', marginBottom: 7 }}>Highlight this month</label>
                <input style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(15,14,23,0.1)', background: '#F9F8F6', fontSize: 14, outline: 'none', color: '#0F0E17', borderRadius: 4 }}
                  value={updates.highlights} onChange={e => upd('highlights', e.target.value)} placeholder="Specific service or product..." />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6566', display: 'block', marginBottom: 7 }}>Anything to avoid</label>
              <input style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(15,14,23,0.1)', background: '#F9F8F6', fontSize: 14, outline: 'none', color: '#0F0E17', borderRadius: 4 }}
                value={updates.avoid} onChange={e => upd('avoid', e.target.value)} placeholder="Don't mention the refurbishment yet..." />
            </div>
          </div>
        </div>

        {/* Extra images */}
        <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.07)', borderRadius: 10, padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ADA8A6' }}>Extra images this month</div>
            <span style={{ fontSize: 11, color: '#ADA8A6' }}>Optional · {extraImages.length}/5</span>
          </div>
          <p style={{ fontSize: 12, color: '#ADA8A6', fontWeight: 300, marginBottom: 14, lineHeight: 1.5 }}>Seasonal photos or new product images specific to {currentMonth}</p>

          {extraImages.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {extraImages.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img.preview} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(15,14,23,0.1)' }} />
                  <button onClick={() => setExtraImages(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, background: '#FF5C35', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {extraImages.length < 5 && (
            <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed rgba(15,14,23,0.1)', borderRadius: 6, padding: '14px', textAlign: 'center', cursor: 'pointer', background: 'rgba(15,14,23,0.01)', transition: 'border-color .15s' }}>
              <div style={{ fontSize: 13, color: '#ADA8A6' }}>+ Add images</div>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
            </div>
          )}
        </div>

        {/* Content type */}
        <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.07)', borderRadius: 10, padding: '24px', marginBottom: 28 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ADA8A6', display: 'block', marginBottom: 12 }}>Content package</label>
          <select style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(15,14,23,0.1)', background: '#F9F8F6', fontSize: 14, outline: 'none', color: '#0F0E17', borderRadius: 4, cursor: 'pointer', appearance: 'none' }}
            value={contentType} onChange={e => setContentType(e.target.value)}>
            <option value="full">Full package — social, email, Google &amp; blog</option>
            <option value="social">Social posts only (16 posts)</option>
            <option value="email">Email newsletters only</option>
            <option value="google">Google Business posts only</option>
            <option value="blog">Blog posts only</option>
          </select>
        </div>

        {/* Generate button */}
        <button onClick={generate} style={{ width: '100%', padding: '17px', background: '#FF5C35', color: 'white', border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s' }}>
          Generate {currentMonth} Content
          <span style={{ fontSize: 18 }}>→</span>
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#ADA8A6', marginTop: 12 }}>Takes about 30–60 seconds</p>
      </div>
    </div>
  )
}
