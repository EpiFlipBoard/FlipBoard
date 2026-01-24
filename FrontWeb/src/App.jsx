import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <NavBar />
      <main className="max-w-6xl mx-auto p-4 w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
