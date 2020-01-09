const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const fields = {
    likes: 0,
    user: 0
  }

  const allUsers = await User.find({}).populate('blogs', fields)
  res.json(allUsers)
})

usersRouter.get('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    const user = await User.findById(id)
    if (user) {
      res.json(user.toJSON())
    } else {
      res.status(404).end()
    }
  } catch(err) {
    next(err)
  }
})

usersRouter.post('/', async (req, res, next) => {
  const newUser = req.body
  try {
    if (!newUser.password)
      throw { name: 'ValidationError', message: 'missing password' }
    if (newUser.password.length <= 2)
      throw { name: 'ValidationError', message: 'short password' }

    const passwordHash = await bcrypt.hash(newUser.password, 10)
    const userObject = new User({ ...newUser,  passwordHash })
    const savedUser = await userObject.save()
    res.json(savedUser)
  } catch (err) {
    next(err)
  }
})

usersRouter.put('/:id', async (req, res, next) => {
  const id = request.params.id
  const userToUpdate = request.body
  try {
    const user = await User.findByIdAndUpdate(id, userToUpdate, { new: true })
    res.json(user.toJSON())
  } catch(err) {
    next(err)
  }
})

usersRouter.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    await User.findByIdAndRemove(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = usersRouter
