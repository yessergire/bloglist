const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const session = require('../utils/session')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const likes = request.body.likes || 0
  const body = request.body
  const token = request.token

  try {
    const user = await session.getCurrentUser(token)
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: likes,
      comments: body.comments,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog.toJSON())
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

const currentUserIsTheCreator = async (request, blog) => {
  const user = await session.getCurrentUser(request.token)
  if (!blog || !user) {
    return false
  }
  return blog.user.toString() === user.id.toString()
}

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const returnedBlog = await Blog
      .findByIdAndUpdate(request.params.id, request.body, { new: true })
      .populate('user', { blogs: 0 })
    response.json(returnedBlog.toJSON())
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (await currentUserIsTheCreator(request, blog)) {
      await blog.delete()
      response.status(204).end()
    } else {
      response.status(401).end()
    }
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/:id/comments', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    const comments = {
      comments: blog.comments.concat(request.body.comment)
    }

    const returnedBlog = await Blog
      .findByIdAndUpdate(request.params.id, comments, { new: true })
      .populate('user', { blogs: 0 })
    response.json(returnedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter
