import Sidebar from '../../components/Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar/>
      <main style={{ marginLeft:210, flex:1, background:'#FFF8F3', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}
