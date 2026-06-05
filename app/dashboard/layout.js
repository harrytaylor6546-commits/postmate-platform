import Sidebar from '../../components/Sidebar'
import '../../styles/globals.css'

export default function AppLayout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar/>
      <main style={{ marginLeft:210, flex:1, background:'#FFF8F3', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}
