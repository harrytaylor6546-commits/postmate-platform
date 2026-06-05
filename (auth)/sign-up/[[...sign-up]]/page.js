import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0f0e17', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:32, padding:24 }}>
      <div style={{ fontFamily:'sans-serif', fontSize:22, fontWeight:800, color:'white' }}>PostMate</div>
      <SignUp appearance={{ variables: { colorPrimary: '#FF5C35' } }}/>
    </div>
  )
}
