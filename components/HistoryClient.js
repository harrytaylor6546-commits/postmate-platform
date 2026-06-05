'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── PARSERS ─────────────────────────────────────────────
function parseSocialPosts(text) {
  if (!text) return []
  const posts = []
  const blocks = text.split(/(?=(?:\*\*)?POST\s+\d+)/i).filter(b => b.trim().length > 20)
  blocks.forEach((block, idx) => {
    const lines = block.split('\n').map(l => l.replace(/\*\*/g, '').trim()).filter(Boolean)
    if (!lines.length) return
    const parts = lines[0].split('|').map(p => p.trim())
    const num = (parts[0] || '').replace(/POST\s*/i, '').trim() || String(idx + 1)
    const platform = (parts[1] || 'Instagram').trim()
    const type = (parts[2] || '').trim()
    let caption = '', hashtags = '', bestTime = ''
    lines.slice(1).forEach(line => {
      const l = line.toLowerCase()
      if (l.startsWith('caption:')) caption = line.replace(/^caption:\s*/i, '').trim()
      else if (l.startsWith('hashtags:')) hashtags = line.replace(/^hashtags:\s*/i, '').trim()
      else if (l.startsWith('best time:')) bestTime = line.replace(/^best time:\s*/i, '').trim()
      else if (!caption && !line.startsWith('#') && line.length > 20) caption = line
    })
    if (caption || hashtags) posts.push({ num, platform, type, caption, hashtags, bestTime })
  })
  return posts
}

function parseEmails(text) {
  if (!text) return []
  const emails = []
  const blocks = text.split(/(?=(?:\*\*)?NEWSLETTER\s+\d+)/i).filter(b => b.trim().length > 20)
  blocks.forEach(block => {
    let subject = '', subjectB = '', preview = '', body = '', cta = '', inBody = false
    block.split('\n').forEach(rawLine => {
      const line = rawLine.replace(/\*\*/g, '').trim()
      const l = line.toLowerCase()
      if (l.startsWith('subject b:')) { subjectB = line.replace(/^subject b:\s*/i, '').trim(); inBody = false }
      else if (l.startsWith('subject:')) { subject = line.replace(/^subject:\s*/i, '').trim(); inBody = false }
      else if (l.startsWith('preview:')) { preview = line.replace(/^preview:\s*/i, '').trim(); inBody = false }
      else if (l.startsWith('cta:')) { cta = line.replace(/^cta:\s*/i, '').trim(); inBody = false }
      else if (l === 'body:' || l.startsWith('body:')) inBody = true
      else if (inBody) body += (body ? '\n' : '') + line
    })
    if (subject || body) emails.push({ subject, subjectB, preview, body: body.trim(), cta })
  })
  return emails
}

function parseGoogle(text) {
  if (!text) return []
  const posts = []
  const blocks = text.split(/(?=(?:\*\*)?GOOGLE\s+(?:POST\s+)?\d+)/i).filter(b => b.trim().length > 20)
  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.replace(/\*\*/g, '').trim()).filter(Boolean)
    const type = ((lines[0] || '').split('|')[1] || 'Update').trim()
    let copy = '', cta = ''
    lines.slice(1).forEach(line => {
      const l = line.toLowerCase()
      if (l.startsWith('copy:')) copy = line.replace(/^copy:\s*/i, '').trim()
      else if (l.startsWith('cta:')) cta = line.replace(/^cta:\s*/i, '').trim()
      else if (!copy && line.length > 20) copy = line
    })
    if (copy) posts.push({ type, copy, cta })
  })
  return posts.length ? posts : (text.length > 30 ? [{ type: 'Post', copy: text, cta: '' }] : [])
}

function parseBlogs(text) {
  if (!text) return []
  const posts = []
  const blocks = text.split(/(?=(?:\*\*)?BLOG\s+(?:POST\s+)?\d+)/i).filter(b => b.trim().length > 20)
  blocks.forEach(block => {
    let title = '', meta = '', keyword = '', outline = '', inOutline = false
    block.split('\n').forEach(rawLine => {
      const line = rawLine.replace(/\*\*/g, '').trim()
      const l = line.toLowerCase()
      if (l.startsWith('title:')) { title = line.replace(/^title:\s*/i, '').trim(); inOutline = false }
      else if (l.startsWith('meta:')) { meta = line.replace(/^meta:\s*/i, '').trim(); inOutline = false }
      else if (l.startsWith('keyword:')) { keyword = line.replace(/^keyword:\s*/i, '').trim(); inOutline = false }
      else if (l.startsWith('outline:')) inOutline = true
      else if (inOutline) outline += (outline ? '\n' : '') + line
    })
    if (title || outline) posts.push({ title, meta, keyword, outline: outline.trim() })
  })
  return posts.length ? posts : [{ title: '', outline: text }]
}

function parseImagePrompts(text) {
  if (!text) return []
  const prompts = []
  const blocks = text.split(/(?=(?:\*\*)?IMAGE\s+\d+)/i).filter(b => b.trim().length > 10)
  blocks.forEach((block, idx) => {
    const lines = block.split('\n').map(l => l.replace(/\*\*/g, '').trim()).filter(Boolean)
    const parts = (lines[0] || '').split('|')
    const theme = (parts[1] || ('Post ' + (idx + 1))).trim()
    let prompt = ''
    lines.slice(1).forEach(line => {
      if (line.toLowerCase().startsWith('prompt:')) prompt = line.replace(/^prompt:\s*/i, '').trim()
      else if (!prompt && line.length > 20) prompt = line
    })
    if (prompt) prompts.push({ num: idx + 1, theme, prompt })
  })
  return prompts
}

// ─── HELPERS ─────────────────────────────────────────────
function CopyBtn({ text, small }) {
  const [ok, setOk] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text || '').then(() => { setOk(true); setTimeout(() => setOk(false), 2000) })
  }
  if (small) {
    return (
      <button onClick={copy} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 12px', background: ok ? '#22c55e' : 'rgba(15,14,23,0.06)', color: ok ? 'white' : '#9a9090', border: 'none', cursor: 'pointer', borderRadius: 100, fontFamily: 'DM Sans,sans-serif', transition: 'all .2s' }}>
        {ok ? 'Copied' : 'Copy'}
      </button>
    )
  }
  return (
    <button onClick={copy} style={{ fontSize: 11, fontWeight: 500, padding: '7px 18px', background: ok ? '#22c55e' : 'white', color: ok ? 'white' : '#0f0e17', border: '1.5px solid ' + (ok ? '#22c55e' : 'rgba(15,14,23,0.12)'), cursor: 'pointer', borderRadius: 100, fontFamily: 'DM Sans,sans-serif', transition: 'all .2s' }}>
      {ok ? 'Copied' : 'Copy'}
    </button>
  )
}

const PLATFORMS = {
  Instagram: { color: '#E1306C', bg: 'rgba(225,48,108,0.1)' },
  Facebook: { color: '#1877F2', bg: 'rgba(24,119,242,0.1)' },
  TikTok: { color: '#0f0e17', bg: 'rgba(0,0,0,0.07)' },
  LinkedIn: { color: '#0A66C2', bg: 'rgba(10,102,194,0.1)' },
}

function PlatformTag({ name }) {
  const p = PLATFORMS[name] || { color: '#FF5C35', bg: 'rgba(255,92,53,0.1)' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', padding: '3px 10px', borderRadius: 100, background: p.bg, color: p.color }}>
      {name}
    </span>
  )
}

function RawFallback({ text }) {
  if (!text) return null
  return (
    <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', padding: 24, marginTop: 16 }}>
      <pre style={{ fontSize: 13, color: '#0f0e17', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans,sans-serif', fontWeight: 300 }}>{text}</pre>
    </div>
  )
}

function ImageCard({ prompt, num, theme }) {
  const [status, setStatus] = useState('idle')
  const [imageUrl, setImageUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function generate() {
    setStatus('generating')
    setErrorMsg('')
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setImageUrl(data.url)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,14,23,0.04)' }}>
      <div style={{ aspectRatio: '1/1', background: '#f5f4f2', position: 'relative', overflow: 'hidden' }}>
        {status === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,92,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              🖼️
            </div>
            <p style={{ fontSize: 12, color: '#9a9090', textAlign: 'center', lineHeight: 1.55, fontFamily: 'DM Sans,sans-serif' }}>Click Generate to create an AI image for this post</p>
            <button onClick={generate} style={{ padding: '10px 22px', background: '#FF5C35', color: 'white', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
              Generate Image
            </button>
          </div>
        )}
        {status === 'generating' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,92,53,0.2)', borderTopColor: '#FF5C35', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <p style={{ fontSize: 12, color: '#9a9090', fontFamily: 'DM Sans,sans-serif' }}>Creating your image...</p>
          </div>
        )}
        {status === 'done' && imageUrl && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={imageUrl} alt={theme} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
              <a href={imageUrl} download target="_blank" rel="noreferrer" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 14 }}>⬇️</a>
              <button onClick={generate} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', fontSize: 14 }}>🔄</button>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }}>
            <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', fontFamily: 'DM Sans,sans-serif' }}>{errorMsg}</p>
            <button onClick={generate} style={{ padding: '8px 18px', background: '#0f0e17', color: 'white', border: 'none', borderRadius: 100, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Try Again</button>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#FF5C35', letterSpacing: '.08em', textTransform: 'uppercase' }}>Image {num}</span>
            <span style={{ fontSize: 11, color: '#9a9090', marginLeft: 8 }}>{theme}</span>
          </div>
          <CopyBtn text={prompt} small />
        </div>
        <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6, fontWeight: 300, fontFamily: 'DM Sans,sans-serif' }}>{prompt}</p>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────
export default function HistoryClient({ history, active }) {
  const router = useRouter()
  const [section, setSection] = useState('social')
  const [copiedAll, setCopiedAll] = useState(false)

  if (!history.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 16, fontFamily: 'DM Sans,sans-serif', background: '#FAFAF8' }}>
        <div style={{ fontSize: 56 }}>✨</div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#0f0e17' }}>Nothing here yet</div>
        <p style={{ fontSize: 14, color: '#9a9090', fontWeight: 300, textAlign: 'center', maxWidth: 280 }}>Generate your first month of content and it will appear here.</p>
        <Link href="/generate" style={{ padding: '13px 28px', background: '#FF5C35', color: 'white', borderRadius: 100, fontSize: 14, fontWeight: 500, textDecoration: 'none', marginTop: 8 }}>Generate Content</Link>
      </div>
    )
  }

  const social = parseSocialPosts(active?.sections?.social)
  const emails = parseEmails(active?.sections?.email)
  const google = parseGoogle(active?.sections?.google)
  const blogs = parseBlogs(active?.sections?.blog)
  const imagePrompts = parseImagePrompts(active?.sections?.images)

  const tabs = [
    { key: 'social', label: 'Social', icon: '📱', count: social.length },
    { key: 'email', label: 'Email', icon: '✉️', count: emails.length },
    { key: 'google', label: 'Google', icon: '🌐', count: google.length },
    { key: 'blog', label: 'Blog', icon: '📝', count: blogs.length },
    { key: 'images', label: 'Images', icon: '🖼️', count: imagePrompts.length },
  ]

  function SectionHeader({ title, subtitle }) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, color: '#0f0e17', marginBottom: 3 }}>{title}</h2>
        <p style={{ fontSize: 12, color: '#9a9090' }}>{subtitle}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'DM Sans,sans-serif', background: '#FAFAF8' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:rgba(15,14,23,0.1);border-radius:10px;} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Sidebar */}
      <div style={{ width: 190, background: 'white', borderRight: '1px solid rgba(15,14,23,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9090' }}>History</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {history.map(h => {
            const isOn = h.id === active?.id
            return (
              <div key={h.id} onClick={() => router.push('/history?id=' + h.id)} style={{ padding: '11px 16px', cursor: 'pointer', background: isOn ? '#FAFAF8' : 'transparent', borderLeft: isOn ? '3px solid #FF5C35' : '3px solid transparent', transition: 'all .15s' }}>
                <div style={{ fontSize: 13, fontWeight: isOn ? 600 : 400, color: isOn ? '#0f0e17' : '#555' }}>{h.month} {h.year}</div>
                <div style={{ fontSize: 11, color: '#b0a8a0', marginTop: 1 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main area */}
      {active ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{ background: 'white', borderBottom: '1px solid rgba(15,14,23,0.07)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: '#0f0e17' }}>{active.month} {active.year}</div>
              <div style={{ fontSize: 12, color: '#9a9090', marginTop: 2 }}>Generated {new Date(active.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(active.raw_content || '').then(() => { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000) }) }} style={{ fontSize: 12, fontWeight: 500, padding: '9px 20px', background: copiedAll ? '#22c55e' : '#0f0e17', color: 'white', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .2s' }}>
              {copiedAll ? 'Copied!' : 'Copy Everything'}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ background: 'white', borderBottom: '1px solid rgba(15,14,23,0.07)', padding: '0 28px', display: 'flex', gap: 2, flexShrink: 0, overflowX: 'auto' }}>
            {tabs.map(t => {
              const isOn = section === t.key
              return (
                <button key={t.key} onClick={() => setSection(t.key)} style={{ padding: '13px 16px', fontSize: 12.5, fontWeight: isOn ? 600 : 400, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'DM Sans,sans-serif', color: isOn ? '#0f0e17' : '#9a9090', borderBottom: isOn ? '2px solid #FF5C35' : '2px solid transparent', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s', whiteSpace: 'nowrap' }}>
                  <span>{t.icon}</span>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: isOn ? '#FF5C35' : 'rgba(15,14,23,0.07)', color: isOn ? 'white' : '#9a9090', padding: '1px 7px', borderRadius: 100, minWidth: 20, textAlign: 'center' }}>
                      {t.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>

            {/* SOCIAL */}
            {section === 'social' && (
              <div>
                <SectionHeader title="Social Posts" subtitle={social.length + ' posts ready to schedule'} />
                {social.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {social.map((post, i) => (
                      <div key={i} style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', boxShadow: '0 2px 8px rgba(15,14,23,0.04)', overflow: 'hidden' }}>
                        <div style={{ padding: '13px 16px 11px', borderBottom: '1px solid rgba(15,14,23,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #FF5C35, #e64e2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>
                              P
                            </div>
                            <PlatformTag name={post.platform} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, color: '#ddd' }}>#{post.num}</span>
                            <CopyBtn text={post.caption + (post.hashtags ? '\n\n' + post.hashtags : '')} small />
                          </div>
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          {post.type && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 8 }}>{post.type}</div>}
                          <p style={{ fontSize: 13.5, color: '#0f0e17', lineHeight: 1.72, fontWeight: 300 }}>{post.caption}</p>
                        </div>
                        {post.hashtags && (
                          <div style={{ padding: '0 16px 14px' }}>
                            <p style={{ fontSize: 12, color: '#1877F2', lineHeight: 1.65 }}>{post.hashtags}</p>
                          </div>
                        )}
                        {post.bestTime && (
                          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(15,14,23,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11 }}>⏰</span>
                            <span style={{ fontSize: 11, color: '#9a9090' }}>Best time: <strong style={{ color: '#555', fontWeight: 500 }}>{post.bestTime}</strong></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <RawFallback text={active?.sections?.social} />}
              </div>
            )}

            {/* EMAIL */}
            {section === 'email' && (
              <div>
                <SectionHeader title="Email Newsletters" subtitle={emails.length + ' newsletter' + (emails.length !== 1 ? 's' : '') + ' — paste into Mailchimp'} />
                {emails.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {emails.map((email, i) => (
                      <div key={i} style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', boxShadow: '0 2px 12px rgba(15,14,23,0.05)', overflow: 'hidden' }}>
                        <div style={{ background: '#f8f8f6', padding: '16px 24px', borderBottom: '1px solid rgba(15,14,23,0.08)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                            </div>
                            <CopyBtn text={['Subject: ' + email.subject, email.subjectB ? 'Subject B: ' + email.subjectB : '', email.preview ? 'Preview: ' + email.preview : '', '', email.body, email.cta ? '\nCTA: ' + email.cta : ''].filter(Boolean).join('\n')} />
                          </div>
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9a9090' }}>Subject A </span>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#0f0e17' }}>{email.subject}</span>
                          </div>
                          {email.subjectB && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#b0a8a0' }}>Subject B </span>
                              <span style={{ fontSize: 14, color: '#555' }}>{email.subjectB}</span>
                            </div>
                          )}
                          {email.preview && (
                            <div style={{ marginTop: 8, padding: '6px 12px', background: 'rgba(15,14,23,0.04)', borderRadius: 4 }}>
                              <span style={{ fontSize: 11, color: '#9a9090', fontStyle: 'italic' }}>Preview: {email.preview}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '28px 32px', maxWidth: 640 }}>
                          <div style={{ fontSize: 14, color: '#2a2a2a', lineHeight: 1.85, whiteSpace: 'pre-line', fontWeight: 300 }}>{email.body}</div>
                          {email.cta && (
                            <div style={{ marginTop: 24 }}>
                              <span style={{ display: 'inline-block', background: '#FF5C35', color: 'white', padding: '12px 28px', fontSize: 13, fontWeight: 600, borderRadius: 100 }}>{email.cta}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <RawFallback text={active?.sections?.email} />}
              </div>
            )}

            {/* GOOGLE */}
            {section === 'google' && (
              <div>
                <SectionHeader title="Google Business Posts" subtitle={google.length + ' posts — add to your Google Business Profile'} />
                {google.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {google.map((post, i) => (
                      <div key={i} style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', boxShadow: '0 2px 8px rgba(15,14,23,0.04)', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', background: 'rgba(66,133,244,0.04)', borderBottom: '1px solid rgba(66,133,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#4285F4', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', fontFamily: 'serif' }}>G</div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#4285F4' }}>Google Business</div>
                              <div style={{ fontSize: 10, color: '#9a9090', textTransform: 'capitalize' }}>{post.type}</div>
                            </div>
                          </div>
                          <CopyBtn text={post.copy} small />
                        </div>
                        <div style={{ padding: 16 }}>
                          <p style={{ fontSize: 13.5, color: '#0f0e17', lineHeight: 1.75, fontWeight: 300 }}>{post.copy}</p>
                          {post.cta && (
                            <div style={{ marginTop: 12, display: 'inline-block', border: '1px solid #4285F4', color: '#4285F4', padding: '6px 16px', fontSize: 12, fontWeight: 500, borderRadius: 4 }}>{post.cta}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <RawFallback text={active?.sections?.google} />}
              </div>
            )}

            {/* BLOG */}
            {section === 'blog' && (
              <div>
                <SectionHeader title="Blog Posts" subtitle={blogs.length + ' SEO-optimised outlines — publish to your website'} />
                {blogs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {blogs.map((post, i) => (
                      <div key={i} style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', boxShadow: '0 2px 12px rgba(15,14,23,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(15,14,23,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 8 }}>Blog Post {i + 1}</div>
                              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#0f0e17', lineHeight: 1.25, marginBottom: 10 }}>{post.title}</h3>
                              {post.meta && <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, fontStyle: 'italic' }}>{post.meta}</p>}
                            </div>
                            <CopyBtn text={[post.title ? 'Title: ' + post.title : '', post.meta ? 'Meta: ' + post.meta : '', post.keyword ? 'Keyword: ' + post.keyword : '', post.outline ? '\nOutline:\n' + post.outline : ''].filter(Boolean).join('\n')} />
                          </div>
                          {post.keyword && (
                            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#16a34a', background: 'rgba(34,197,94,0.08)', padding: '5px 14px', borderRadius: 100 }}>
                              Target keyword: {post.keyword}
                            </div>
                          )}
                        </div>
                        {post.outline && (
                          <div style={{ padding: '20px 28px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9090', marginBottom: 14 }}>Outline</div>
                            {post.outline.split('\n').filter(Boolean).map((line, j) => {
                              const isH2 = line.startsWith('##') || /^H2:/i.test(line) || /^\d+\.\s/.test(line)
                              const isH3 = line.startsWith('###') || /^H3:/i.test(line) || /^-\s/.test(line)
                              const clean = line.replace(/^#+\s*/, '').replace(/^H[23]:\s*/i, '').replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim()
                              if (!clean) return null
                              return (
                                <div key={j} style={{ padding: isH3 ? '4px 0 4px 20px' : '8px 0 4px', borderLeft: isH3 ? '2px solid rgba(255,92,53,0.2)' : 'none' }}>
                                  <span style={{ fontSize: isH2 ? 14 : 12.5, fontWeight: isH2 ? 600 : 400, color: isH2 ? '#0f0e17' : '#666', fontFamily: isH2 ? 'Syne,sans-serif' : 'DM Sans,sans-serif' }}>
                                    {isH3 ? '> ' : ''}{clean}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <RawFallback text={active?.sections?.blog} />}
              </div>
            )}

            {/* IMAGES */}
            {section === 'images' && (
              <div>
                <SectionHeader title="Images" subtitle="AI-generated images for your posts. Requires FAL_API_KEY in Vercel env vars." />
                {imagePrompts.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {imagePrompts.map((item, i) => (
                      <ImageCard key={i} num={item.num} theme={item.theme} prompt={item.prompt} />
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'white', border: '1px solid rgba(15,14,23,0.08)', padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#0f0e17', marginBottom: 8 }}>No images yet</div>
                    <p style={{ fontSize: 13, color: '#9a9090', fontWeight: 300, maxWidth: 320, margin: '0 auto 20px' }}>Generate new content to get AI image prompts alongside your posts.</p>
                    <Link href="/generate" style={{ padding: '11px 24px', background: '#FF5C35', color: 'white', borderRadius: 100, fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>Generate Content</Link>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a9090', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14 }}>Select a month from the sidebar</div>
        </div>
      )}
    </div>
  )
}
