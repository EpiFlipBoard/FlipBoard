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
import Profile from './pages/Profile.jsx'
import EditCollection from './pages/EditCollection.jsx'
import Follows from './pages/Follows.jsx'
import Statistics from './pages/Statistics.jsx'
import Settings from './pages/Settings.jsx'

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
      { path: 'profile', element: <Profile /> },
      { path: 'collections/:id/edit', element: <EditCollection /> },
      { path: 'follows', element: <Follows /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'settings', element: <Settings /> },
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
