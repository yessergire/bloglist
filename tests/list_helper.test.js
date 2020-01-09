const listHelper = require('../utils/list_helper')
const blogs = require('../utils/blogs_for_test').blogs

const listWithSingleBlog = [blogs[1]]

test('dummy returns one', () => expect(listHelper.dummy([])).toBe(1))

describe('total likes', () => {
  test('of an empty list is zero', () =>
    expect(listHelper.totalLikes([])).toBe(0))

  test('when list has only one blog equals the likes of that', () =>
    expect(listHelper.totalLikes(listWithSingleBlog)).toBe(5))

  test('of a list is correct', () =>
    expect(listHelper.totalLikes(blogs)).toBe(36))
})

describe('favorite blog', () => {
  test('of an empty list is {}', () =>
    expect(listHelper.favoriteBlog([])).toEqual({}))

  test('when list has only one blog the favorite blog equals that blog', () =>
    expect(listHelper.favoriteBlog(listWithSingleBlog))
      .toEqual(listWithSingleBlog[0]))

  test('of a list is correct', () =>
    expect(listHelper.favoriteBlog(blogs)).toEqual(blogs[2]))
})

describe('most blogs', () => {
  test('of an empty list is {}', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual({})
  })

  test('when list has only one blog the author with most blogs equals author of that blog', () => {
    const result = listHelper.mostBlogs(listWithSingleBlog)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('of a list is correct', () => {
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})
