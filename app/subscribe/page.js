'use client'
import { useState } from 'react'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Social media only',
    monthly: { price: 59, priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID },
    yearly: { price: 49, total: 588, save: 120, priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID },
    features: ['16 social posts / month', 'Instagram & Facebook captions', 'Hashtags + best posting times', 'AI image generation'],
    popular: false,
  },
  {
    id: 'full',
    name: 'Full Package',
    desc: 'Everything included',
    monthly: { price: 99, priceId: process.env.NEXT_PUBLIC_STRIPE_FULL_PRICE_ID },
    yearly: { price: 79, total: 948, save: 240, priceId: process.env.NEXT_PUBLIC_STRIPE_FULL_YEARLY_PRICE_ID },
    features: ['16 social posts / month', '2 email newsletters (A/B subjects)', '4 Google Business posts', '2 SEO blog articles', '8 AI-generated images'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    desc: 'For faster growth',
    monthly: { price: 149, priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID },
    yearly: { price: 119, total: 1428, save: 360, priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID },
    features: ['24 social posts / month', '4 email newsletters', '4 Google Business posts', '4 SEO blog articles', 'Priority support'],
    popular: false,
  },
]

export default function SubscribePage() {
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(null)

  async function subscribe(plan) {
    setLoading(plan.id)
    try {
      const priceId = billing === 'yearly' ? plan.yearly.priceId : plan.monthly.priceId
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName: plan.name + (billing === 'yearly' ? ' (Yearly)' : '') })
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (e) {
      alert('Error: ' + e.message)
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e17', fontFamily: 'DM Sans, sans-serif', padding: '48px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'white', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ width: 28, height: 28, background: '#FF5C35', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>P</div>
          PostMate
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          Choose your plan
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 300, maxWidth: 460, margin: '0 auto' }}>
          Pay monthly and cancel anytime, or pay yearly and get two months free.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: 4, marginTop: 28 }}>
          <button onClick={() => setBilling('monthly')} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', border: 'none', cursor: 'pointer', background: billing === 'monthly' ? 'white' : 'transparent', color: billing === 'monthly' ? '#0f0e17' : 'rgba(255,255,255,0.5)', transition: 'all .2s' }}>
            Monthly
          </button>
          <button onClick={() => setBilling('yearly')} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', border: 'none', cursor: 'pointer', background: billing === 'yearly' ? 'white' : 'transparent', color: billing === 'yearly' ? '#0f0e17' : 'rgba(255,255,255,0.5)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            Yearly
            <span style={{ fontSize: 10, fontWeight: 700, color: '#FF5C35', letterSpacing: '.04em' }}>2 MONTHS FREE</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', maxWidth: 960, margin: '0 auto 40px' }}>
        {PLANS.map(plan => {
          const p = billing === 'yearly' ? plan.yearly : plan.monthly
          return (
            <div key={plan.id} style={{
              background: plan.popular ? 'white' : 'rgba(255,255,255,0.04)',
              border: plan.popular ? '2px solid #FF5C35' : '1px solid rgba(255,255,255,0.08)',
              padding: '36px 32px',
              width: 280,
              position: 'relative',
              transform: plan.popular ? 'scale(1.04)' : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#FF5C35', color: 'white', padding: '4px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  ★ Most Popular
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#FF5C35', marginBottom: 6 }}>{plan.desc}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: plan.popular ? '#0f0e17' : 'white', marginBottom: 16 }}>{plan.name}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: plan.popular ? '#FF5C35' : 'white', lineHeight: 1, marginBottom: 6 }}>
                <sup style={{ fontSize: 22, verticalAlign: 'super' }}>£</sup>{p.price}
                <span style={{ fontSize: 14, fontWeight: 400, color: plan.popular ? '#9a9090' : 'rgba(255,255,255,0.4)' }}>/mo</span>
              </div>
              <div style={{ fontSize: 12, color: billing === 'yearly' ? '#16a34a' : (plan.popular ? '#9a9090' : 'rgba(255,255,255,0.4)'), marginBottom: 24, fontWeight: 500, minHeight: 18 }}>
                {billing === 'yearly'
                  ? '£' + p.total.toLocaleString() + ' billed yearly · save £' + p.save
                  : 'Billed monthly · cancel anytime'}
              </div>
              <div style={{ height: 1, background: plan.popular ? 'rgba(15,14,23,0.08)' : 'rgba(255,255,255,0.06)', marginBottom: 20 }}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: plan.popular ? '#0f0e17' : 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
                    <span style={{ color: '#FF5C35', flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => subscribe(plan)}
                disabled={!!loading}
                style={{
                  width: '100%', padding: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, borderRadius: 100,
                  background: plan.popular ? '#FF5C35' : 'rgba(255,92,53,0.12)',
                  color: plan.popular ? 'white' : '#FF5C35',
                  opacity: loading && loading !== plan.id ? 0.5 : 1,
                  transition: 'all .2s',
                }}
              >
                {loading === plan.id ? 'Redirecting to checkout…' : 'Get started →'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Trust signals */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {['Cancel monthly plans anytime', 'Secure payment via Stripe', 'Generate your first month tonight'].map(t => (
            <div key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#FF5C35' }}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
