const dummy = () => {
  return 1
}

const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = blogs => {
  if (blogs.length === 0) {
    return null
  }
  return blogs.reduce((favorite, blog) =>
    blog.likes > favorite.likes ? blog : favorite
  )
}

const mostBlogs = blogs => {
  if (blogs.length === 0) {
    return null
  }
  const counts = {}
  blogs.forEach(blog => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })
  const top = Object.entries(counts).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
  )
  return { author: top[0], blogs: top[1] }
}

const mostLikes = blogs => {
  if (blogs.length === 0) {
    return null
  }
  const likes = {}
  blogs.forEach(blog => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
  })
  const top = Object.entries(likes).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
  )
  return { author: top[0], likes: top[1] }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
