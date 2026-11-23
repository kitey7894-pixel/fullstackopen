const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token = null
let userId = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Root User', passwordHash })
  const savedUser = await user.save()
  userId = savedUser._id

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  token = loginResponse.body.token

  const blogs = helper.initialBlogs.map(
    blog => new Blog({ ...blog, user: userId })
  )
  await Promise.all(blogs.map(blog => blog.save()))
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier property of blogs is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data and a valid token', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    const titles = blogsAtEnd.map(blog => blog.title)
    assert.ok(titles.includes('Canonical string reduction'))
  })

  test('fails with status 401 if token is not provided', async () => {
    const newBlog = {
      title: 'No token blog',
      author: 'Anon',
      url: 'http://example.com/no-token'
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('defaults likes to 0 if the likes property is missing', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Someone',
      url: 'http://example.com/no-likes'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('fails with status 400 if title is missing', async () => {
    const newBlog = { author: 'Someone', url: 'http://example.com/no-title' }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('fails with status 400 if url is missing', async () => {
    const newBlog = { title: 'No url', author: 'Someone' }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status 204 if id is valid and user is the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    const titles = blogsAtEnd.map(blog => blog.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  test('fails with status 401 without a token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating the likes of an existing blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })

  test('fails with status 404 if the blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send({ title: 'x', url: 'http://x.example', likes: 1 })
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})
