'use client'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/generate', label: 'Generate', icon: '⚡' },
  { href: '/history', label: 'History', icon: '📚' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function AppLayout({ children }) {
  const path = usePathname()
  if (path === '/onboarding') return <>{children}</>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0f0e17', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#FF5C35', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>P</div>
            PostMate
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = path === href
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                marginBottom: 2, borderRadius: 8,
                background: active ? 'rgba(255,92,53,0.12)' : 'transparent',
                color: active ? '#FF5C35' : 'rgba(255,255,255,0.45)',
                fontSize: 13, fontWeight: active ? 500 : 400,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>{icon}</span>{label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserButton appearance={{ variables: { colorPrimary: '#FF5C35' } }}/>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>Account</span>
        </div>
      </div>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, background: '#FFF8F3', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
