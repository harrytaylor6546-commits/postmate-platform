'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HistoryClient({ history, active }) {
  const router = useRouter()
  const [section, setSection] = useState('social')
  const [copied, setCopied] = useState('')

  function copy(key) {
    const text = key==='all' ? active?.raw_content : active?.sections?.[key]
    if (!text) return
    navigator.clipboard.writeText(text).then(()=>{ setCopied(key); setTimeout(()=>setCopied(''),2000) })
  }

  if (!history.length) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh', flexDirection:'column', gap:16, fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ fontSize:48 }}>📚</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#0f0e17' }}>No history yet</div>
      <Link href="/generate" style={{ padding:'12px 28px', background:'#FF5C35', color:'white', borderRadius:100, fontSize:14, fontWeight:500, textDecoration:'none' }}>Generate Your First Content →</Link>
    </div>
  )

  const tabS = (a) => ({ padding:'11px 16px', fontSize:11, fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer', background:'none', border:'none', fontFamily:'DM Sans,sans-serif', color:a?'#FF5C35':'rgba(255,255,255,0.35)', borderBottom:a?'2px solid #FF5C35':'2px solid transparent', marginBottom:-1, whiteSpace:'nowrap' })

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'DM Sans,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      <div style={{ width:200, background:'white', borderRight:'1px solid rgba(15,14,23,0.08)', overflowY:'auto', flexShrink:0 }}>
        <div style={{ padding:'18px 16px 10px', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#0f0e17' }}>History</div>
        {history.map(h=>(
          <div key={h.id} onClick={()=>router.push(`/history?id=${h.id}`)} style={{ padding:'12px 16px', cursor:'pointer', background:h.id===active?.id?'rgba(255,92,53,0.06)':'transparent', borderLeft:h.id===active?.id?'3px solid #FF5C35':'3px solid transparent' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#0f0e17' }}>{h.month} {h.year}</div>
            <div style={{ fontSize:11, color:'#9a9090', marginTop:2 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</div>
          </div>
        ))}
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {active ? <>
          <div style={{ background:'#0f0e17', padding:'0 16px', display:'flex', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
            <div style={{ display:'flex', flex:1 }}>
              {[['social','📱 Social'],['email','✉️ Email'],['google','🌍 Google'],['blog','📝 Blog']].map(([k,l])=>(
                <button key={k} style={tabS(section===k)} onClick={()=>setSection(k)}>{l}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>copy(section)} style={{ fontSize:10, cursor:'pointer', background:copied===section?'#FF5C35':'rgba(255,255,255,0.08)', color:copied===section?'white':'rgba(255,255,255,0.5)', border:'none', padding:'6px 14px', borderRadius:100, fontFamily:'DM Sans,sans-serif', textTransform:'uppercase', letterSpacing:'.06em' }}>
                {copied===section?'✓ Copied':'Copy Section'}
              </button>
              <button onClick={()=>copy('all')} style={{ fontSize:10, cursor:'pointer', background:copied==='all'?'#FF5C35':'rgba(255,255,255,0.05)', color:copied==='all'?'white':'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.08)', padding:'6px 14px', borderRadius:100, fontFamily:'DM Sans,sans-serif', textTransform:'uppercase', letterSpacing:'.06em' }}>
                {copied==='all'?'✓ Copied':'Copy All'}
              </button>
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', background:'#0f0e17', padding:'20px 24px' }}>
            <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:10 }}>{active.month} {active.year}</div>
            <pre style={{ color:'rgba(255,255,255,0.8)', fontFamily:'DM Sans,sans-serif', fontSize:13, lineHeight:1.85, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
              {active.sections?.[section] || 'No content for this section.'}
            </pre>
          </div>
        </> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'#9a9090' }}>Select a month</div>}
      </div>
    </div>
  )
}
