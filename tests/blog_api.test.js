const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

let userID = {}

beforeAll(async () => {
  await User.deleteMany({})
  const user = new User(helper.authorized_user)
  const newUser = await user.save()
  userID = newUser._id.toString()
})

const getKey = async () => {
  const res = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
  return `bearer ${res.body.token}`
}

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    for (let blogObject of helper.blogs) {
      let blog = new Blog({ ...blogObject, user: userID })
      await blog.save()
    }
  })

  describe('retrieving a blog', () => {
    test('a specific blog can be viewed', async () => {
      const allBlogs = await helper.blogsInDb()
      const blog = allBlogs[0]
      const resultBlog = await api
        .get(`/api/blogs/${blog.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultBlog.body).toEqual({ ...blog, user: userID })
    })
  })

  describe('retrieving blogs', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body.length).toBe(helper.blogs.length)
    })

    test('blog has an id field', async () => {
      const response = await api.get('/api/blogs')
      const blogs = response.body
      expect(blogs[0].id).toBeDefined()
    })

    test('a specific blog is within the returned blogs', async () => {
      const response = await api.get('/api/blogs')
      const blogs = response.body
      const titles = blogs.map(r => r.title)
      expect(titles).toContain(helper.blogs[0].title)
    })
  })

  describe('adding a new blog', () => {

    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'Building Great User Experiences with Concurrent Mode and Suspense',
        author: 'Joseph Savona',
        url: 'https://reactjs.org/blog',
        likes: 3
      }

      const key = await getKey()
      await api
        .post('/api/blogs')
        .set('Authorization', key)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.blogs.length + 1)

      const titles = blogsAtEnd.map(p => p.title)
      expect(titles).toContain(newBlog.title)
    })

    test('a blog missing likes field can be added', async () => {
      const newBlog = {
        title: 'Building Great User Experiences with Concurrent Mode and Suspense',
        author: 'Joseph Savona',
        url: 'https://reactjs.org/blog'
      }

      const key = await getKey()
      await api
        .post('/api/blogs')
        .set('Authorization', key)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.blogs.length + 1)

      const returnedBlog = blogsAtEnd.find(blog => blog.title === newBlog.title)
      expect(returnedBlog).toBeDefined()
      expect(returnedBlog.likes).toBe(0)
    })

    test('a blog missing title is not added', async () => {
      const newBlog = {
        author: 'Joseph Savona',
        url: 'https://reactjs.org/blog'
      }

      const key = await getKey()
      await api
        .post('/api/blogs')
        .set('Authorization', key)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.blogs.length)
    })

    test('a blog missing url is not added', async () => {
      const newBlog = {
        title: 'Building Great User Experiences with Concurrent Mode and Suspense',
        author: 'Joseph Savona',
      }

      const key = await getKey()
      await api
        .post('/api/blogs')
        .set('Authorization', key)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.blogs.length)
    })
  })

  describe('delete a blog', () => {
    test('can be deleted', async () => {
      let allBlogs = await helper.blogsInDb()
      const blog = allBlogs[0]

      const key = await getKey()
      await api
        .delete(`/api/blogs/${blog.id}`)
        .set('Authorization', key)
        .expect(204)

      allBlogs = await helper.blogsInDb()
      expect(allBlogs.length).toBe(helper.blogs.length - 1)

      expect(allBlogs.map(r => r.title)).not.toContain(blog.title)
    })
  })


    describe('update a blog', () => {
      test('can be updated', async () => {
        let allBlogs = await helper.blogsInDb()
        const blog = allBlogs[0]
        blog.likes = 10

        const key = await getKey()
        await api
          .put(`/api/blogs/${blog.id}`)
          .set('Authorization', key)
          .send(blog)
          .expect(200)

        allBlogs = await helper.blogsInDb()
        expect(allBlogs.length).toBe(helper.blogs.length)
        expect(allBlogs.find(r => r.id === blog.id).likes)
        .toBe(blog.likes)
      })
    })


})

afterAll(() => {
  mongoose.connection.close()
})
