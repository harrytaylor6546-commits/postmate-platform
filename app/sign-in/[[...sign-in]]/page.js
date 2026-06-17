import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0e17', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6c5ce7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>P</div>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>PostMate</span>
      </div>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  )
}
