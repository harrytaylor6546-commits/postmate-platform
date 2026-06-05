'use client'
import Link from 'next/link'

export default function DashboardClient({ profile, history, currentMonth, currentYear, alreadyGenerated }) {
  return (
    <div style={{ padding:36, maxWidth:820, fontFamily:'DM Sans,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#0f0e17', marginBottom:4 }}>Welcome back, {profile.business_name?.split(' ')[0]}! 👋</h1>
      <p style={{ fontSize:14, color:'#9a9090', fontWeight:300, marginBottom:32 }}>Your AI content team is ready for {currentMonth}.</p>

      <div style={{ background:'#0f0e17', padding:'36px 32px', marginBottom:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'#FF5C35' }}/>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'#FF5C35', marginBottom:8 }}>{alreadyGenerated ? '✓ Done this month' : 'This Month'}</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'white', marginBottom:8 }}>
          {alreadyGenerated ? `${currentMonth} content generated` : `Generate your ${currentMonth} ${currentYear} content`}
        </div>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:22 }}>
          {alreadyGenerated ? 'Already generated this month. Generate again to refresh.' : 'Add promotions or news, click Generate. Full content in ~60 seconds.'}
        </p>
        <Link href="/generate" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', background:'#FF5C35', color:'white', borderRadius:100, fontSize:13, fontWeight:500, textDecoration:'none' }}>
          ⚡ {alreadyGenerated ? 'Regenerate' : `Generate ${currentMonth} Content`}
        </Link>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2, marginBottom:16 }}>
        {[['16','Social Posts'],['2','Newsletters'],['4','Google Posts'],['2','Blog Posts']].map(([n,l])=>(
          <div key={l} style={{ background:'white', padding:'18px 12px', textAlign:'center', border:'1px solid rgba(15,14,23,0.07)' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#FF5C35' }}>{n}</div>
            <div style={{ fontSize:10, color:'#9a9090', marginTop:3 }}>{l}/mo</div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div style={{ background:'white', border:'1px solid rgba(15,14,23,0.07)', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:12, color:'#9a9090' }}>Last generated</div>
            <div style={{ fontSize:14, fontWeight:500, color:'#0f0e17', marginTop:2 }}>{history[0].month} {history[0].year}</div>
          </div>
          <Link href={`/history?id=${history[0].id}`} style={{ padding:'7px 16px', background:'transparent', border:'1.5px solid rgba(15,14,23,0.12)', fontSize:12, borderRadius:100, color:'#0f0e17', textDecoration:'none' }}>View →</Link>
        </div>
      )}
    </div>
  )
}
