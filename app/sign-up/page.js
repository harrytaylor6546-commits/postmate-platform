import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0f0e17', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:32, padding:24 }}>
      <div style={{ fontFamily:'sans-serif', fontSize:22, fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, background:'#FF5C35', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800 }}>P</div>
        PostMate
      </div>
      <SignUp appearance={{ variables: { colorPrimary: '#FF5C35', borderRadius: '4px' } }} />
    </div>
  )
}
