import { useState } from 'react'
import { TextField, Button, Typography, Stack } from '@mui/material'

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
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        create new
      </Typography>
      <form onSubmit={addBlog}>
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField
            label="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="title"
            slotProps={{ htmlInput: { 'data-testid': 'title' } }}
          />
          <TextField
            label="author"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="author"
            slotProps={{ htmlInput: { 'data-testid': 'author' } }}
          />
          <TextField
            label="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="url"
            slotProps={{ htmlInput: { 'data-testid': 'url' } }}
          />
          <Button variant="contained" type="submit">
            create
          </Button>
        </Stack>
      </form>
    </div>
  )
}

export default BlogForm
