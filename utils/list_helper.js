const _ = require('lodash')

const dummy = blogs => 1

const totalLikes = blogs =>
  blogs.reduce((likes, blog) =>
    likes + blog.likes, 0)

const favoriteBlog = blogs =>
  blogs.reduce((maxLikesBlog, blog) =>
    (maxLikesBlog.likes > blog.likes) ? maxLikesBlog : blog, {})

const mostBlogs = blogs =>
  _.reduce(_.countBy(blogs, 'author'), (result, count, name) =>
    result > count ? result : { author: name, blogs: count }, {})

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }
