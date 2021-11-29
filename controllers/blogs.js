const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})
 

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  
  const user = await User.findById(body.userId)
  
  const blog = new Blog({
    title: request.body.title,
    author: user._id,
    url: request.body.url,
    likes: request.body.likes
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)  
})

module.exports = blogsRouter