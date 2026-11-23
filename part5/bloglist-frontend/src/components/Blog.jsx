import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Link as MuiLink
} from '@mui/material'

const Blog = ({ blog, user, onLike, onRemove }) => {
  if (!blog) {
    return null
  }

  const isCreator = user && blog.user && blog.user.username === user.username

  return (
    <Card sx={{ mt: 2 }} className="blog">
      <CardContent>
        <Typography variant="h5" component="h2">
          {blog.title}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          by {blog.author}
        </Typography>
        <MuiLink href={blog.url} target="_blank" rel="noreferrer">
          {blog.url}
        </MuiLink>
        <Typography sx={{ mt: 1 }}>likes {blog.likes}</Typography>
        {blog.user && (
          <Typography variant="body2" color="text.secondary">
            added by {blog.user.name}
          </Typography>
        )}
      </CardContent>
      {user && (
        <CardActions>
          <Button variant="contained" size="small" onClick={() => onLike(blog)}>
            like
          </Button>
          {isCreator && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onRemove(blog)}
            >
              delete
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  )
}

export default Blog
