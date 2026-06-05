'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const NAV = [
  { href:'/dashboard', icon:'🏠', label:'Dashboard' },
  { href:'/generate', icon:'⚡', label:'Generate' },
  { href:'/history', icon:'📚', label:'History' },
  { href:'/settings', icon:'⚙️', label:'Settings' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <div style={{ width:210, background:'#0f0e17', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:50 }}>
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, background:'#FF5C35', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>P</div>
          PostMate
        </div>
      </div>
      <nav style={{ flex:1, padding:'10px 8px' }}>
        {NAV.map(({ href,icon,label }) => {
          const active = path === href
          return (
            <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', marginBottom:2, borderRadius:8, background:active?'rgba(255,92,53,0.12)':'transparent', color:active?'#FF5C35':'rgba(255,255,255,0.45)', fontSize:13, fontWeight:active?500:400, textDecoration:'none' }}>
              <span>{icon}</span>{label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
        <UserButton appearance={{ variables:{ colorPrimary:'#FF5C35' } }}/>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Account</span>
      </div>
    </div>
  )
}
