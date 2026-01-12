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
import CollectionDetail from './pages/CollectionDetail.jsx'
import Follows from './pages/Follows.jsx'
import Statistics from './pages/Statistics.jsx'
import Settings from './pages/Settings.jsx'
import CreateArticle from './pages/CreateArticle.jsx'
import About from './pages/About.jsx'
import Careers from './pages/Careers.jsx'
import Press from './pages/Press.jsx'
import Help from './pages/Help.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Cookies from './pages/Cookies.jsx'
import Explore from './pages/Explore.jsx'
import Download from './pages/Download.jsx'

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
      { path: 'collections/:id', element: <CollectionDetail /> },
      { path: 'collections/:id/edit', element: <EditCollection /> },
      { path: 'create', element: <CreateArticle /> },
      { path: 'follows', element: <Follows /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'settings', element: <Settings /> },
      { path: 'login', element: <Home /> },
      { path: 'signup', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'careers', element: <Careers /> },
      { path: 'press', element: <Press /> },
      { path: 'help', element: <Help /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'cookies', element: <Cookies /> },
      { path: 'explore', element: <Explore /> },
      { path: 'download', element: <Download /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
