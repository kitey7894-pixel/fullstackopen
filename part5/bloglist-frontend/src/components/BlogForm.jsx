import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = event => {
    event.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
          title:{' '}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="title"
            data-testid="title"
          />
        </div>
        <div>
          author:{' '}
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="author"
            data-testid="author"
          />
        </div>
        <div>
          url:{' '}
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="url"
            data-testid="url"
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm
