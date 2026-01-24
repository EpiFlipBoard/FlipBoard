import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Comments from '../components/Comments.jsx'

function Article() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/posts/${id}`)
        const data = await res.json()
        if (res.ok) setPost(data.post)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="p-10 text-center text-white">Chargement...</div>
  if (!post) return <div className="p-10 text-center text-white">Article non trouvé</div>

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-white">
      {post.imageUrl && (
        <div className="h-64 md:h-96 w-full rounded-xl overflow-hidden mb-8 shadow-2xl">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight break-words">{post.title}</h1>
      <div className="flex items-center gap-4 text-gray-400 mb-8 border-b border-gray-800 pb-8">
        <Link 
          to={`/author/${encodeURIComponent(post.authorId || post.author)}`} 
          className="font-semibold text-brand-red hover:underline"
        >
          {post.author}
        </Link>
        <span>•</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="prose prose-invert max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: post.content || post.description }} />
      </div>

      <Comments postId={id} />

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link to="/" className="btn btn-muted hover:text-white transition-colors">Retour à l'accueil</Link>
      </div>
    </div>
  )
}

export default Article