'use client'
import { useState, useRef } from 'react'

const VOICES = [
  { v: 'friendly and warm', l: 'Friendly & Warm', e: '😊', d: 'Approachable, personal, like talking to a friend' },
  { v: 'professional and trustworthy', l: 'Professional', e: '💼', d: 'Polished, credible, expert in your field' },
  { v: 'fun and energetic', l: 'Fun & Energetic', e: '⚡', d: 'Upbeat, enthusiastic, full of personality' },
  { v: 'luxury and premium', l: 'Luxury', e: '✨', d: 'Elegant, refined, aspirational' },
  { v: 'casual and conversational', l: 'Casual', e: '👋', d: 'Relaxed, down-to-earth, no-frills' },
]

async function compressImage(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 800, c = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w = max } else { w = Math.round(w*max/h); h = max } }
      c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      res({ data: c.toDataURL('image/jpeg', .72).split(',')[1], type: 'image/jpeg', preview: c.toDataURL('image/jpeg', .4), name: file.name })
    }
    img.onerror = () => rej(new Error('Failed')); img.src = url
  })
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.07)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(15,14,23,0.05)', background: 'rgba(15,14,23,0.01)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ADA8A6' }}>{title}</div>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6566', display: 'block', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}

export default function SettingsClient({ profile }) {
  const [form, setForm] = useState({
    business_name: profile?.business_name || '',
    business_type: profile?.business_type || '',
    location: profile?.location || '',
    website: profile?.website || '',
    offerings: profile?.offerings || '',
    audience: profile?.audience || '',
    voice: profile?.voice || 'friendly and warm',
    instagram: profile?.instagram || '',
    facebook: profile?.facebook || '',
    images: profile?.images || [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const imgRef = useRef()
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inpStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid rgba(15,14,23,0.1)', background: '#F9F8F6', fontSize: 14, fontWeight: 300, outline: 'none', color: '#0F0E17', borderRadius: 4, fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s' }

  async function handleImgs(e) {
    const files = [...e.target.files]
    const compressed = await Promise.all(files.slice(0, 5 - form.images.length).map(compressImage))
    s('images', [...form.images, ...compressed].slice(0, 5))
    e.target.value = ''
  }

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F6', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} input,textarea,select{font-family:'DM Sans',sans-serif;} input:focus,textarea:focus,select:focus{border-color:#FF5C35!important;outline:none;}`}</style>

      <div style={{ padding: '48px', maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 1.5, background: '#FF5C35', display: 'inline-block' }} />
            Profile
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#0F0E17', marginBottom: 6 }}>Settings</h1>
          <p style={{ fontSize: 15, color: '#6B6566', fontWeight: 300 }}>Changes apply to your next content generation.</p>
        </div>

        {/* Business details */}
        <Section title="Business Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Business Name"><input style={inpStyle} value={form.business_name} onChange={e => s('business_name', e.target.value)} /></Field>
              <Field label="Type of Business"><input style={inpStyle} value={form.business_type} onChange={e => s('business_type', e.target.value)} /></Field>
              <Field label="Location"><input style={inpStyle} value={form.location} onChange={e => s('location', e.target.value)} /></Field>
              <Field label="Website"><input style={inpStyle} value={form.website} onChange={e => s('website', e.target.value)} /></Field>
            </div>
            <Field label="What You Offer">
              <textarea style={{ ...inpStyle, minHeight: 88, resize: 'vertical', lineHeight: 1.6 }} value={form.offerings} onChange={e => s('offerings', e.target.value)} />
            </Field>
            <Field label="Your Target Customers">
              <textarea style={{ ...inpStyle, minHeight: 72, resize: 'vertical', lineHeight: 1.6 }} value={form.audience} onChange={e => s('audience', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Social accounts */}
        <Section title="Social Accounts">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Instagram Handle"><input style={inpStyle} value={form.instagram} onChange={e => s('instagram', e.target.value)} placeholder="@yourhandle" /></Field>
            <Field label="Facebook Page"><input style={inpStyle} value={form.facebook} onChange={e => s('facebook', e.target.value)} placeholder="Your Page Name" /></Field>
          </div>
        </Section>

        {/* Brand voice */}
        <Section title="Brand Voice">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VOICES.map(v => (
              <div key={v.v} onClick={() => s('voice', v.v)} style={{ padding: '14px 16px', border: '1.5px solid ' + (form.voice === v.v ? '#FF5C35' : 'rgba(15,14,23,0.08)'), background: form.voice === v.v ? 'rgba(255,92,53,0.03)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 6, transition: 'all .15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: form.voice === v.v ? 'rgba(255,92,53,0.1)' : '#F3F2EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{v.e}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: form.voice === v.v ? 500 : 400, color: '#0F0E17' }}>{v.l}</div>
                  <div style={{ fontSize: 12, color: '#ADA8A6', fontWeight: 300, marginTop: 1 }}>{v.d}</div>
                </div>
                {form.voice === v.v && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FF5C35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', flexShrink: 0 }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Brand images */}
        <Section title="Brand Images">
          <p style={{ fontSize: 13, color: '#ADA8A6', fontWeight: 300, marginBottom: 16, lineHeight: 1.55 }}>Your logo and product photos. PostMate references these when writing content and generating images. Up to 5.</p>
          {form.images.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {form.images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img.preview} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(15,14,23,0.08)' }} />
                  <button onClick={() => s('images', form.images.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#FF5C35', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          )}
          {form.images.length < 5 && (
            <div onClick={() => imgRef.current.click()} style={{ border: '2px dashed rgba(15,14,23,0.1)', borderRadius: 6, padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color .15s' }}>
              <div style={{ fontSize: 13, color: '#ADA8A6' }}>+ Add images ({form.images.length}/5)</div>
              <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImgs} />
            </div>
          )}
        </Section>

        {/* Save */}
        <button onClick={save} disabled={saving} style={{ background: saved ? '#22c55e' : '#FF5C35', color: 'white', border: 'none', padding: '14px 36px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 100, transition: 'background .25s', letterSpacing: '0.01em' }}>
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
