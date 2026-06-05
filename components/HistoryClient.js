'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SECTIONS = [
  { key:'social', label:'Social Posts', icon:'📱' },
  { key:'email', label:'Email', icon:'✉️' },
  { key:'google', label:'Google', icon:'🌍' },
  { key:'blog', label:'Blog', icon:'📝' },
]

// Parse social posts into individual cards
function parseSocialPosts(text) {
  if (!text) return []
  const posts = []
  const blocks = text.split(/(?=\*?\*?POST\s+\d+)/i).filter(b => b.trim())
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const header = lines[0].replace(/\*\*/g, '')
    const parts = header.split('|').map(p => p.trim())
    const num = parts[0]?.replace(/POST\s*/i,'').trim()
    const platform = parts[1] || 'Instagram'
    const type = parts[2] || ''
    let caption = '', hashtags = '', bestTime = ''
    for (const line of lines.slice(1)) {
      if (line.toLowerCase().startsWith('caption:')) caption = line.replace(/^caption:/i,'').trim()
      else if (line.toLowerCase().startsWith('hashtags:')) hashtags = line.replace(/^hashtags:/i,'').trim()
      else if (line.toLowerCase().startsWith('best time:')) bestTime = line.replace(/^best time:/i,'').trim()
      else if (!caption && !line.startsWith('#')) caption = line
    }
    if (caption || hashtags) posts.push({ num, platform, type, caption, hashtags, bestTime })
  }
  return posts
}

// Parse email newsletters
function parseEmails(text) {
  if (!text) return []
  const emails = []
  const blocks = text.split(/(?=\*?\*?NEWSLETTER\s+\d+)/i).filter(b => b.trim())
  for (const block of blocks) {
    if (!block.trim()) continue
    let subject = '', subjectB = '', preview = '', body = '', cta = ''
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    let inBody = false
    for (const line of lines) {
      const low = line.toLowerCase()
      if (low.startsWith('subject b:') || low.startsWith('subject b ')) subjectB = line.replace(/^subject b[:\s]*/i,'').trim()
      else if (low.startsWith('subject:')) subject = line.replace(/^subject:/i,'').trim()
      else if (low.startsWith('preview:')) preview = line.replace(/^preview:/i,'').trim()
      else if (low.startsWith('cta:')) { cta = line.replace(/^cta:/i,'').trim(); inBody = false }
      else if (low === 'body:' || low.startsWith('body:')) inBody = true
      else if (inBody && !low.startsWith('cta:')) body += (body ? '\n' : '') + line
    }
    if (subject || body) emails.push({ subject, subjectB, preview, body, cta })
  }
  return emails
}

// Parse Google posts
function parseGoogle(text) {
  if (!text) return []
  const posts = []
  const blocks = text.split(/(?=\*?\*?GOOGLE\s+(?:POST\s+)?\d+)/i).filter(b => b.trim())
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const header = lines[0].replace(/\*\*/g, '')
    const parts = header.split('|').map(p => p.trim())
    const type = parts[1] || 'Update'
    let copy = '', cta = ''
    for (const line of lines.slice(1)) {
      if (line.toLowerCase().startsWith('copy:')) copy = line.replace(/^copy:/i,'').trim()
      else if (line.toLowerCase().startsWith('cta:')) cta = line.replace(/^cta:/i,'').trim()
      else if (!copy) copy = line
    }
    if (copy) posts.push({ type, copy, cta })
  }
  return posts.length ? posts : [{ type:'Post', copy:text, cta:'' }]
}

// Parse blog posts
function parseBlogs(text) {
  if (!text) return []
  const posts = []
  const blocks = text.split(/(?=\*?\*?BLOG\s+(?:POST\s+)?\d+)/i).filter(b => b.trim())
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    let title = '', meta = '', keyword = '', outline = ''
    let inOutline = false
    for (const line of lines) {
      const low = line.toLowerCase()
      if (low.startsWith('title:')) title = line.replace(/^title:/i,'').trim()
      else if (low.startsWith('meta:')) meta = line.replace(/^meta:/i,'').trim()
      else if (low.startsWith('keyword:')) keyword = line.replace(/^keyword:/i,'').trim()
      else if (low.startsWith('outline:')) inOutline = true
      else if (inOutline) outline += (outline ? '\n' : '') + line
    }
    if (title || outline) posts.push({ title, meta, keyword, outline })
  }
  return posts.length ? posts : [{ title:'Blog Post', outline:text }]
}

function PlatformBadge({ platform }) {
  const colors = {
    Instagram: { bg:'rgba(225,48,108,0.1)', color:'#e1306c' },
    Facebook: { bg:'rgba(24,119,242,0.1)', color:'#1877f2' },
    TikTok: { bg:'rgba(0,0,0,0.08)', color:'#0f0e17' },
    'Twitter/X': { bg:'rgba(0,0,0,0.06)', color:'#0f0e17' },
    LinkedIn: { bg:'rgba(0,119,181,0.1)', color:'#0077b5' },
  }
  const c = colors[platform] || { bg:'rgba(255,92,53,0.1)', color:'#FF5C35' }
  return <span style={{ fontSize:11, fontWeight:600, letterSpacing:'.06em', padding:'3px 10px', borderRadius:100, background:c.bg, color:c.color }}>{platform}</span>
}

function CopyBtn({ text, label='Copy' }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000) })
  }
  return (
    <button onClick={copy} style={{ fontSize:11, fontWeight:500, letterSpacing:'.06em', padding:'5px 14px', background:copied?'#22c55e':'rgba(15,14,23,0.06)', color:copied?'white':'#9a9090', border:'none', cursor:'pointer', borderRadius:100, fontFamily:'DM Sans,sans-serif', transition:'all .2s' }}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}

export default function HistoryClient({ history, active }) {
  const router = useRouter()
  const [section, setSection] = useState('social')
  const [copiedAll, setCopiedAll] = useState(false)

  function copyAll() {
    navigator.clipboard.writeText(active?.raw_content || '').then(() => { setCopiedAll(true); setTimeout(()=>setCopiedAll(false),2000) })
  }

  if (!history.length) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh', flexDirection:'column', gap:16, fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ fontSize:48 }}>📚</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#0f0e17' }}>No content yet</div>
      <Link href="/generate" style={{ padding:'12px 28px', background:'#FF5C35', color:'white', borderRadius:100, fontSize:14, fontWeight:500, textDecoration:'none' }}>Generate Your First Content →</Link>
    </div>
  )

  const socialPosts = parseSocialPosts(active?.sections?.social)
  const emails = parseEmails(active?.sections?.email)
  const googlePosts = parseGoogle(active?.sections?.google)
  const blogPosts = parseBlogs(active?.sections?.blog)

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'DM Sans,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:rgba(15,14,23,0.15);border-radius:2px;}`}</style>

      {/* History sidebar */}
      <div style={{ width:200, background:'white', borderRight:'1px solid rgba(15,14,23,0.07)', overflowY:'auto', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 10px', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#0f0e17' }}>History</div>
        {history.map(h=>(
          <div key={h.id} onClick={()=>router.push(`/history?id=${h.id}`)} style={{ padding:'12px 16px', cursor:'pointer', background:h.id===active?.id?'rgba(255,92,53,0.05)':'transparent', borderLeft:h.id===active?.id?'3px solid #FF5C35':'3px solid transparent', transition:'all .15s' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#0f0e17' }}>{h.month} {h.year}</div>
            <div style={{ fontSize:11, color:'#9a9090', marginTop:2 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#F7F6F3' }}>

        {active ? (<>
          {/* Top tabs bar */}
          <div style={{ background:'white', borderBottom:'1px solid rgba(15,14,23,0.08)', padding:'0 24px', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            <div style={{ display:'flex', flex:1 }}>
              {SECTIONS.map(s=>{
                const counts = { social:socialPosts.length, email:emails.length, google:googlePosts.length, blog:blogPosts.length }
                const active_tab = section===s.key
                return (
                  <button key={s.key} onClick={()=>setSection(s.key)} style={{ padding:'14px 18px', fontSize:12, fontWeight:500, cursor:'pointer', background:'none', border:'none', fontFamily:'DM Sans,sans-serif', color:active_tab?'#FF5C35':'#9a9090', borderBottom:active_tab?'2px solid #FF5C35':'2px solid transparent', marginBottom:-1, display:'flex', alignItems:'center', gap:6, transition:'all .15s' }}>
                    <span>{s.icon}</span>
                    {s.label}
                    {counts[s.key]>0 && <span style={{ fontSize:10, background:active_tab?'#FF5C35':'rgba(15,14,23,0.08)', color:active_tab?'white':'#9a9090', padding:'1px 7px', borderRadius:100 }}>{counts[s.key]}</span>}
                  </button>
                )
              })}
            </div>
            <button onClick={copyAll} style={{ fontSize:11, fontWeight:500, padding:'7px 16px', background:copiedAll?'#22c55e':'#0f0e17', color:'white', border:'none', borderRadius:100, cursor:'pointer', fontFamily:'DM Sans,sans-serif', letterSpacing:'.04em', flexShrink:0 }}>
              {copiedAll?'✓ Copied!':'Copy All'}
            </button>
          </div>

          {/* Content */}
          <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

            {/* SOCIAL POSTS */}
            {section==='social' && (
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#0f0e17', marginBottom:4 }}>Social Media Posts</div>
                <div style={{ fontSize:12, color:'#9a9090', marginBottom:20 }}>{socialPosts.length} posts generated · Click Copy on each to grab captions individually</div>
                {socialPosts.length > 0 ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:16 }}>
                    {socialPosts.map((post, i) => (
                      <div key={i} style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:'20px', borderRadius:2 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:'#9a9090' }}>POST {post.num || i+1}</span>
                            <PlatformBadge platform={post.platform}/>
                          </div>
                          <CopyBtn text={`${post.caption}\n\n${post.hashtags}`}/>
                        </div>
                        {post.type && <div style={{ fontSize:11, color:'#FF5C35', fontWeight:500, marginBottom:10, textTransform:'capitalize' }}>{post.type}</div>}
                        <p style={{ fontSize:13.5, color:'#0f0e17', lineHeight:1.7, marginBottom:12, fontWeight:300 }}>{post.caption}</p>
                        {post.hashtags && <div style={{ fontSize:12, color:'#1877f2', lineHeight:1.65, marginBottom:10 }}>{post.hashtags}</div>}
                        {post.bestTime && (
                          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9a9090', paddingTop:10, borderTop:'1px solid rgba(15,14,23,0.05)' }}>
                            <span>🕐</span> Best time: {post.bestTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background:'white', padding:'24px', border:'1px solid rgba(15,14,23,0.08)' }}>
                    <pre style={{ fontSize:13, color:'#0f0e17', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'DM Sans,sans-serif', fontWeight:300 }}>{active?.sections?.social}</pre>
                  </div>
                )}
              </div>
            )}

            {/* EMAIL */}
            {section==='email' && (
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#0f0e17', marginBottom:4 }}>Email Newsletters</div>
                <div style={{ fontSize:12, color:'#9a9090', marginBottom:20 }}>{emails.length} newsletter{emails.length!==1?'s':''} · Copy and paste into Mailchimp or your email tool</div>
                {emails.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    {emails.map((email, i) => (
                      <div key={i} style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)' }}>
                        {/* Email header */}
                        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(15,14,23,0.07)', background:'rgba(15,14,23,0.02)' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:'#9a9090', letterSpacing:'.06em', textTransform:'uppercase' }}>Newsletter {i+1}</span>
                            <CopyBtn text={`Subject: ${email.subject}\n\n${email.body}\n\nCTA: ${email.cta}`}/>
                          </div>
                          <div style={{ marginBottom:6 }}>
                            <span style={{ fontSize:11, color:'#9a9090', fontWeight:500 }}>Subject A: </span>
                            <span style={{ fontSize:14, fontWeight:500, color:'#0f0e17' }}>{email.subject}</span>
                          </div>
                          {email.subjectB && <div style={{ marginBottom:6 }}>
                            <span style={{ fontSize:11, color:'#9a9090', fontWeight:500 }}>Subject B: </span>
                            <span style={{ fontSize:14, fontWeight:500, color:'#0f0e17' }}>{email.subjectB}</span>
                          </div>}
                          {email.preview && <div>
                            <span style={{ fontSize:11, color:'#9a9090', fontWeight:500 }}>Preview: </span>
                            <span style={{ fontSize:12, color:'#9a9090', fontStyle:'italic' }}>{email.preview}</span>
                          </div>}
                        </div>
                        {/* Email body */}
                        <div style={{ padding:'20px' }}>
                          <div style={{ fontSize:13.5, color:'#0f0e17', lineHeight:1.8, whiteSpace:'pre-line', fontWeight:300, marginBottom:16 }}>{email.body}</div>
                          {email.cta && (
                            <div style={{ display:'inline-block', background:'#FF5C35', color:'white', padding:'10px 24px', fontSize:13, fontWeight:500, borderRadius:100 }}>{email.cta}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background:'white', padding:'24px', border:'1px solid rgba(15,14,23,0.08)' }}>
                    <pre style={{ fontSize:13, color:'#0f0e17', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'DM Sans,sans-serif', fontWeight:300 }}>{active?.sections?.email}</pre>
                  </div>
                )}
              </div>
            )}

            {/* GOOGLE */}
            {section==='google' && (
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#0f0e17', marginBottom:4 }}>Google Business Posts</div>
                <div style={{ fontSize:12, color:'#9a9090', marginBottom:20 }}>{googlePosts.length} posts · Post directly to your Google Business Profile</div>
                {googlePosts.length > 0 ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
                    {googlePosts.map((post, i) => (
                      <div key={i} style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:'20px' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'.06em', padding:'3px 10px', borderRadius:100, background:'rgba(66,133,244,0.1)', color:'#4285f4', textTransform:'capitalize' }}>{post.type}</span>
                          <CopyBtn text={post.copy}/>
                        </div>
                        <p style={{ fontSize:13.5, color:'#0f0e17', lineHeight:1.75, fontWeight:300, marginBottom:12 }}>{post.copy}</p>
                        {post.cta && <div style={{ fontSize:12, color:'#4285f4', fontWeight:500 }}>CTA: {post.cta}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background:'white', padding:'24px', border:'1px solid rgba(15,14,23,0.08)' }}>
                    <pre style={{ fontSize:13, color:'#0f0e17', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'DM Sans,sans-serif', fontWeight:300 }}>{active?.sections?.google}</pre>
                  </div>
                )}
              </div>
            )}

            {/* BLOG */}
            {section==='blog' && (
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#0f0e17', marginBottom:4 }}>Blog Posts</div>
                <div style={{ fontSize:12, color:'#9a9090', marginBottom:20 }}>{blogPosts.length} SEO-optimised outlines · Publish to your website or blog</div>
                {blogPosts.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    {blogPosts.map((post, i) => (
                      <div key={i} style={{ background:'white', border:'1px solid rgba(15,14,23,0.08)', padding:'24px' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:14 }}>
                          <div>
                            <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'#0f0e17', marginBottom:6 }}>{post.title}</div>
                            {post.meta && <p style={{ fontSize:12, color:'#9a9090', lineHeight:1.6, fontStyle:'italic' }}>{post.meta}</p>}
                          </div>
                          <CopyBtn text={`${post.title}\n\nMeta: ${post.meta}\nKeyword: ${post.keyword}\n\nOutline:\n${post.outline}`}/>
                        </div>
                        {post.keyword && (
                          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'#16a34a', background:'rgba(34,197,94,0.08)', padding:'4px 12px', borderRadius:100, marginBottom:14 }}>
                            🎯 Keyword: {post.keyword}
                          </div>
                        )}
                        {post.outline && (
                          <div style={{ paddingTop:14, borderTop:'1px solid rgba(15,14,23,0.06)' }}>
                            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'#9a9090', marginBottom:10 }}>Outline</div>
                            <div style={{ fontSize:13, color:'#0f0e17', lineHeight:1.85, whiteSpace:'pre-line', fontWeight:300 }}>{post.outline}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background:'white', padding:'24px', border:'1px solid rgba(15,14,23,0.08)' }}>
                    <pre style={{ fontSize:13, color:'#0f0e17', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'DM Sans,sans-serif', fontWeight:300 }}>{active?.sections?.blog}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </>) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'#9a9090' }}>Select a month to view content</div>
        )}
      </div>
    </div>
  )
}
