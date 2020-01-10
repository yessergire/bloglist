const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getCurrentUser = async (token) => {
  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    return await User.findById(decodedToken.id)
  }
}

module.exports = {
  getCurrentUser
}
