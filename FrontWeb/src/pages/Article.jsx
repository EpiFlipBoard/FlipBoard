import { useParams, Link } from 'react-router-dom'

function Article() {
  const { id } = useParams()
  return (
    <div>
      <div className="h-40 rounded-xl bg-gradient-to-br from-brand-red to-pink-600 mb-6" />
      <div className="card p-6">
        <h1>Article {id}</h1>
        <p className="mt-3 text-gray-700">
          This is a placeholder article view. Integrate real content ingestion
          and rendering to replace this.
        </p>
        <div className="mt-4">
          <Link to="/" className="btn btn-muted">Back</Link>
        </div>
      </div>
    </div>
  )
}

export default Article