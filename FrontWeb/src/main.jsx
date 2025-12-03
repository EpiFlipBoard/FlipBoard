import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Article from './pages/Article.jsx'
import Favorites from './pages/Favorites.jsx'
import Search from './pages/Search.jsx'
import Admin from './pages/Admin.jsx'
import Newsletter from './pages/Newsletter.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'article/:id', element: <Article /> },
      { path: 'favorites', element: <Favorites /> },
      { path: 'search', element: <Search /> },
      { path: 'admin', element: <Admin /> },
      { path: 'newsletter', element: <Newsletter /> },
      { path: 'login', element: <Home /> },
      { path: 'signup', element: <Home /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
