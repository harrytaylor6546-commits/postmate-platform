'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const NAV = [
  { href: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { href: '/generate', icon: '◈', label: 'Generate' },
  { href: '/history', icon: '◫', label: 'History' },
  { href: '/settings', icon: '◎', label: 'Settings' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <div style={{
      width: 220,
      background: '#0F0E17',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: '#FF5C35',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: 'white',
            fontFamily: 'Syne, sans-serif',
            flexShrink: 0,
          }}>P</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1 }}>PostMate</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.06em' }}>Content Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 12px', marginBottom: 8 }}>Menu</div>
        {NAV.map(({ href, icon, label }) => {
          const active = path === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              marginBottom: 2,
              borderRadius: 8,
              background: active ? 'rgba(255,92,53,0.1)' : 'transparent',
              color: active ? '#FF5C35' : 'rgba(255,255,255,0.4)',
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              transition: 'all 0.15s',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              position: 'relative',
            }}>
              {active && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 18,
                  background: '#FF5C35',
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
              <span style={{ fontSize: 16, opacity: active ? 1 : 0.5 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserButton appearance={{ variables: { colorPrimary: '#FF5C35' } }} />
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>My Account</div>
          </div>
        </div>
      </div>
    </div>
  )
}
