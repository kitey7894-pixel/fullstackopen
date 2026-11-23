import { useState } from 'react'

const Blog = ({ blog, user, onLike, onRemove }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const canRemove = user && blog.user && blog.user.username === user.username

  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} {blog.author}{' '}
        <button onClick={() => setVisible(!visible)}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes} <button onClick={() => onLike(blog)}>like</button>
          </div>
          <div>{blog.user && blog.user.name}</div>
          {canRemove && <button onClick={() => onRemove(blog)}>remove</button>}
        </div>
      )}
    </div>
  )
}

export default Blog
