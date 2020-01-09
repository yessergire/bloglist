const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially some user saved',  () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const userObject = new User({ username: 'root', password: 'password' })
    await userObject.save()
  })

  test('creation succeeds with a new username', async () => {
    const allUsers = await helper.usersInDb()
    const newUser = {
      username: 'newRoot',
      name: 'Admin',
      password: 'crypto',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterCreate = await helper.usersInDb()
    expect(usersAfterCreate.length).toBe(allUsers.length + 1)
    expect(usersAfterCreate.map(u => u.username)).toContain(newUser.username)
  })

  test('can\'t create new user if username is already taken', async () => {
    const allUsers = await helper.usersInDb()
    const newUser = {
      username: 'root',
      name: 'Admin',
      password: 'crypto',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('to be unique')

    const usersAfterCreate = await helper.usersInDb()
    expect(usersAfterCreate.length).toBe(allUsers.length)
  })

  test('can\'t create new user if username is missing', async () => {
    const allUsers = await helper.usersInDb()
    const newUser = {
      name: 'Admin',
      password: 'crypto',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` is required')
    const usersAfterCreate = await helper.usersInDb()
    expect(usersAfterCreate.length).toBe(allUsers.length)
  })

  test('can\'t create new user if username is too short', async () => {
    const allUsers = await helper.usersInDb()
    const newUser = {
      username: 'ro',
      name: 'Admin',
      password: 'crypto',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('is shorter than the minimum allowed length')
    const usersAfterCreate = await helper.usersInDb()
    expect(usersAfterCreate.length).toBe(allUsers.length)
  })

  test('can\'t create new user if password is missing', async () => {
    const allUsers = await helper.usersInDb()
    const newUser = {
      username: 'newRoot',
      name: 'Admin'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing password')
    const usersAfterCreate = await helper.usersInDb()
    expect(usersAfterCreate.length).toBe(allUsers.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const allUsers = await helper.usersInDb()
    const newUser = {
      username: 'newRoot',
      name: 'Admin',
      password: 'c',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('short password')
    const usersAfterCreate = await helper.usersInDb()
    expect(usersAfterCreate.length).toBe(allUsers.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
