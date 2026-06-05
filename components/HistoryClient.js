'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SECTIONS = [['social','📱 Social'],['email','✉️ Email'],['google','🌍 Google'],['blog','📝 Blog']]

export default function HistoryClient({ history, active }) {
  const router = useRouter()
  const [section, setSection] = useState('social')
  const [copied, setCopied] = useState('')

  function copy(key) {
    const text = key === 'all' ? active?.raw_content : active?.sections?.[key]
    if (!text) return
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(()=>setCopied(''),2000) })
  }

  if (history.length === 0) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>📚</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#0f0e17' }}>No content yet</div>
      <p style={{ fontSize:14, color:'#9a9090', fontWeight:300 }}>Generated content will appear here each month.</p>
      <Link href="/generate" style={{ padding:'12px 28px', background:'#FF5C35', color:'white', border:'none', borderRadius:100, fontSize:14, fontWeight:500 }}>Generate Your First Content →</Link>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'calc(100vh - 0px)', overflow:'hidden' }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* History list sidebar */}
      <div style={{ width:220, background:'white', borderRight:'1px solid rgba(15,14,23,0.08)', overflowY:'auto', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 12px', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#0f0e17' }}>History</div>
        {history.map(h=>(
          <div key={h.id} onClick={()=>router.push(`/history?id=${h.id}`)} style={{ padding:'12px 16px', cursor:'pointer', background: h.id===active?.id ? 'rgba(255,92,53,0.06)' : 'transparent', borderLeft: h.id===active?.id ? '3px solid #FF5C35' : '3px solid transparent', transition:'all .15s' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#0f0e17' }}>{h.month} {h.year}</div>
            <div style={{ fontSize:11, color:'#9a9090', marginTop:2 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</div>
          </div>
        ))}
      </div>

      {/* Content view */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {active ? (
          <>
            {/* Top bar */}
            <div style={{ background:'#0f0e17', padding:'0 20px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
              <div style={{ display:'flex', flex:1, gap:4 }}>
                {SECTIONS.map(([key,label])=>(
                  <button key={key} onClick={()=>setSection(key)} style={{ padding:'12px 16px', fontSize:12, fontWeight:500, cursor:'pointer', background:section===key?'rgba(255,92,53,0.12)':'none', color:section===key?'#FF5C35':'rgba(255,255,255,0.4)', border:'none', fontFamily:'DM Sans,sans-serif', borderBottom:section===key?'2px solid #FF5C35':'2px solid transparent', marginBottom:-1, transition:'all .15s' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>copy(section)} style={{ padding:'7px 16px', fontSize:11, cursor:'pointer', background: copied===section?'#FF5C35':'rgba(255,255,255,0.08)', color: copied===section?'white':'rgba(255,255,255,0.5)', border:'none', fontFamily:'DM Sans,sans-serif', borderRadius:100, letterSpacing:'.06em', textTransform:'uppercase', transition:'all .2s' }}>
                  {copied===section?'✓ Copied':'Copy Section'}
                </button>
                <button onClick={()=>copy('all')} style={{ padding:'7px 16px', fontSize:11, cursor:'pointer', background: copied==='all'?'#FF5C35':'rgba(255,255,255,0.05)', color: copied==='all'?'white':'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.08)', fontFamily:'DM Sans,sans-serif', borderRadius:100, letterSpacing:'.06em', textTransform:'uppercase', transition:'all .2s' }}>
                  {copied==='all'?'✓ Copied':'Copy All'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex:1, overflowY:'auto', background:'#0f0e17', padding:'24px 28px', animation:'fadeIn .3s ease' }}>
              <pre style={{ color:'rgba(255,255,255,0.78)', fontFamily:'DM Sans,sans-serif', fontSize:13, lineHeight:1.85, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                {active.sections?.[section] || 'No content for this section.'}
              </pre>
            </div>
          </>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'#9a9090' }}>Select a month to view content</div>
        )}
      </div>
    </div>
  )
}
