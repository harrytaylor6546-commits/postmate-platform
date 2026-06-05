'use client'
import Link from 'next/link'

export default function DashboardClient({ profile, history, currentMonth, currentYear, alreadyGenerated }) {
  return (
    <div style={{ padding: 40, maxWidth: 820, animation: 'fadeIn .4s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#0f0e17', marginBottom: 6 }}>
        Welcome back, {profile.business_name?.split(' ')[0]}! 👋
      </h1>
      <p style={{ fontSize: 14, color: '#9a9090', fontWeight: 300, marginBottom: 36 }}>
        Your AI content team is ready for {currentMonth}.
      </p>

      {/* Main CTA */}
      <div style={{ background: '#0f0e17', padding: '40px 36px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#FF5C35' }}/>
        <div style={{ position: 'absolute', right: -24, top: -24, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,92,53,0.06)' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 10 }}>
            {alreadyGenerated ? '✓ Done for this month' : 'This Month'}
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>
            {alreadyGenerated ? `${currentMonth} content generated` : `Generate your ${currentMonth} ${currentYear} content`}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.7, marginBottom: 28, maxWidth: 480 }}>
            {alreadyGenerated
              ? 'You\'ve already generated content this month. You can generate again to refresh with new updates.'
              : 'Add any promotions or news for this month, then get your full content package in about 60 seconds.'
            }
          </p>
          <Link href="/generate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#FF5C35', color: 'white', border: 'none', fontSize: 14, fontWeight: 500, borderRadius: 100, transition: 'background .2s' }}>
            ⚡ {alreadyGenerated ? 'Regenerate Content' : `Generate ${currentMonth} Content`}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, marginBottom: 20 }}>
        {[['16','Social Posts / mo'],['2','Newsletters / mo'],['4','Google Posts / mo'],['2','Blog Posts / mo']].map(([n,l])=>(
          <div key={l} style={{ background: 'white', padding: '20px 16px', textAlign: 'center', border: '1px solid rgba(15,14,23,0.07)' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#FF5C35' }}>{n}</div>
            <div style={{ fontSize: 11, color: '#9a9090', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0f0e17', marginBottom: 12 }}>Recent Content</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {history.map(h => (
              <Link key={h.id} href={`/history?id=${h.id}`} style={{ background: 'white', border: '1px solid rgba(15,14,23,0.07)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0f0e17' }}>{h.month} {h.year}</span>
                  <span style={{ fontSize: 11, color: '#9a9090', marginLeft: 10 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                <span style={{ fontSize: 12, color: '#FF5C35' }}>View →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
