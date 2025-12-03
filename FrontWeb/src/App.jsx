import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'

function App() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />
      <main className="max-w-6xl mx-auto p-4'">
        <Outlet />
      </main>
    </div>
  )
}

export default App
