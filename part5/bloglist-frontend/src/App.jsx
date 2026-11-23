import { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useMatch
} from 'react-router-dom'
import { Container, AppBar, Toolbar, Button, Typography, Box } from '@mui/material'
import Blog from './components/Blog'
import BlogList from './components/BlogList'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const STORAGE_KEY = 'loggedBloglistUser'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem(STORAGE_KEY)
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })
  const [notification, setNotification] = useState(null)

  const navigate = useNavigate()
  const match = useMatch('/blogs/:id')

  useEffect(() => {
    blogService.getAll().then(initialBlogs => setBlogs(initialBlogs))
  }, [])

  useEffect(() => {
    if (user) {
      blogService.setToken(user.token)
    }
  }, [user])

  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async credentials => {
    try {
      const loggedUser = await loginService.login(credentials)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      navigate('/')
      return true
    } catch {
      notify('wrong username or password', 'error')
      return false
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    navigate('/')
  }

  const createBlog = async blogObject => {
    try {
      const createdBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat({ ...createdBlog, user: { username: user.username, name: user.name } }))
      notify(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      navigate('/')
    } catch (error) {
      notify(error.response?.data?.error || 'creating blog failed', 'error')
    }
  }

  const likeBlog = async blog => {
    const updatedBlog = await blogService.update(blog.id, {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: blog.user?.id || blog.user
    })
    setBlogs(
      blogs.map(b => (b.id === blog.id ? { ...b, likes: updatedBlog.likes } : b))
    )
  }

  const removeBlog = async blog => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
      notify(`blog ${blog.title} removed`)
      navigate('/')
    }
  }

  const blog = match ? blogs.find(b => b.id === match.params.id) : null

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">
            blogs
          </Button>
          {user && (
            <Button color="inherit" component={Link} to="/create">
              create new
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {user ? (
            <>
              <Typography sx={{ mr: 2 }}>{user.name} logged in</Typography>
              <Button color="inherit" variant="outlined" onClick={handleLogout}>
                logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Notification notification={notification} />

      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} />} />
        <Route
          path="/blogs/:id"
          element={
            <Blog blog={blog} user={user} onLike={likeBlog} onRemove={removeBlog} />
          }
        />
        <Route
          path="/create"
          element={
            user ? <BlogForm createBlog={createBlog} /> : <Navigate replace to="/login" />
          }
        />
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
      </Routes>
    </Container>
  )
}

export default App
