import { useParams } from 'react-router-dom'

function Article() {
  const { id } = useParams()
  return (
    <div className="prose max-w-none">
      <h1>Article {id}</h1>
      <p>
        This is a placeholder article view. Integrate real content ingestion
        and rendering to replace this.
      </p>
    </div>
  )
}

export default Article