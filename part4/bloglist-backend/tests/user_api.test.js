const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'andrew',
      name: 'Andrew Reis',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    const usernames = usersAtEnd.map(user => user.username)
    assert.ok(usernames.includes(newUser.username))
  })

  test('creation fails with status 400 if username is already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = { username: 'root', name: 'Duplicate', password: 'salainen' }

    const result = await api.post('/api/users').send(newUser).expect(400)

    assert.ok(result.body.error.includes('expected `username` to be unique'))
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with status 400 if username is shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = { username: 'ab', name: 'Too Short', password: 'salainen' }

    await api.post('/api/users').send(newUser).expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with status 400 if password is shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = { username: 'validname', name: 'Bad Password', password: 'ab' }

    const result = await api.post('/api/users').send(newUser).expect(400)

    assert.ok(result.body.error.includes('password must be at least 3 characters'))
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
