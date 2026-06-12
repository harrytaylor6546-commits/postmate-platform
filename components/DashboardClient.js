'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function DashboardClient({ profile, history, currentMonth, currentYear, alreadyGenerated }) {
  const [portalLoading, setPortalLoading] = useState(false)
  const plan = profile.plan || 'trial'
  const isActive = ['trial', 'active'].includes(plan)
  const firstName = profile.business_name?.split(' ')[0] || 'there'

  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening'

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (e) { alert(e.message); setPortalLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F6', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@200;300;400;500&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .fade-1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .05s both} .fade-2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .15s both} .fade-3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .25s both} .fade-4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .35s both} .stat-card:hover{transform:translateY(-2px);} .stat-card{transition:transform .2s;}`}</style>

      <div style={{ padding: '48px 48px 64px', maxWidth: 900 }}>

        {/* Header */}
        <div className="fade-1" style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ADA8A6', marginBottom: 8 }}>{greeting}</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#0F0E17', lineHeight: 1.1, marginBottom: 6 }}>
            {profile.business_name}
          </h1>
          <p style={{ fontSize: 15, color: '#6B6566', fontWeight: 300 }}>
            {profile.business_type} &middot; {profile.location}
          </p>
        </div>

        {/* Status banner */}
        {plan === 'trial' && (
          <div className="fade-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 6, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#15803d' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Free trial active — no charge until your trial ends
            </div>
            <button onClick={openPortal} style={{ fontSize: 12, color: '#15803d', background: 'none', border: '1px solid rgba(34,197,94,0.25)', padding: '5px 14px', cursor: 'pointer', borderRadius: 100, fontFamily: 'DM Sans,sans-serif', fontWeight: 500 }}>
              {portalLoading ? 'Loading...' : 'Manage'}
            </button>
          </div>
        )}

        {!isActive && (
          <div className="fade-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(255,92,53,0.06)', border: '1px solid rgba(255,92,53,0.2)', borderRadius: 6, marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: '#c2410c' }}>Your subscription is inactive</div>
            <Link href="/subscribe" style={{ fontSize: 12, color: 'white', background: '#FF5C35', padding: '5px 14px', borderRadius: 100, fontWeight: 500, textDecoration: 'none' }}>Reactivate</Link>
          </div>
        )}

        {/* Hero generate card */}
        <div className="fade-2" style={{ background: '#0F0E17', borderRadius: 12, padding: '40px 44px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          {/* Decorative gradient */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,53,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 200, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,53,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 1.5, background: '#FF5C35', display: 'inline-block', borderRadius: 1 }} />
                  {currentMonth} {currentYear}
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>
                  {alreadyGenerated ? 'Content generated.' : 'Ready to generate.'}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.7, maxWidth: 400 }}>
                  {alreadyGenerated
                    ? 'Your ' + currentMonth + ' content is ready. Generate again anytime to refresh with new updates.'
                    : 'Add your promotions and news for ' + currentMonth + ', then get your full content package in 60 seconds.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
                {isActive ? (
                  <Link href="/generate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#FF5C35', color: 'white', borderRadius: 100, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all .2s', letterSpacing: '0.01em' }}>
                    {alreadyGenerated ? 'Regenerate' : 'Generate Content'}
                    <span style={{ fontSize: 16 }}>→</span>
                  </Link>
                ) : (
                  <Link href="/subscribe" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: 100, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                    Subscribe to generate
                  </Link>
                )}
                {alreadyGenerated && history.length > 0 && (
                  <Link href={'/history?id=' + history[0].id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.02em' }}>
                    View last output →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { n: '16', l: 'Social posts', sub: 'per month' },
            { n: '2', l: 'Newsletters', sub: 'per month' },
            { n: '4', l: 'Google posts', sub: 'per month' },
            { n: '2', l: 'Blog posts', sub: 'per month' },
          ].map(({ n, l, sub }) => (
            <div key={l} className="stat-card" style={{ background: 'white', border: '1px solid rgba(15,14,23,0.07)', borderRadius: 8, padding: '20px 18px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#FF5C35', lineHeight: 1, marginBottom: 6 }}>{n}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F0E17' }}>{l}</div>
              <div style={{ fontSize: 11, color: '#ADA8A6', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="fade-4">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ADA8A6', marginBottom: 14 }}>Recent Content</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {history.slice(0, 5).map(h => (
                <Link key={h.id} href={'/history?id=' + h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'white', border: '1px solid rgba(15,14,23,0.07)', borderRadius: 6, textDecoration: 'none', transition: 'border-color .15s' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F0E17' }}>{h.month} {h.year}</span>
                    <span style={{ fontSize: 11, color: '#ADA8A6', marginLeft: 12 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#FF5C35', fontWeight: 500 }}>View →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
