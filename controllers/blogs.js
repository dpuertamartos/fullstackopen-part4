const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('author', {username: 1, name: 1})
    response.json(blogs)
})
 

blogsRouter.post('/', async (request, response) => {
  const userid = request.userid
  const user = await User.findById(userid)
  
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
  const userid = request.userid
  const blog = await Blog.findById(request.params.id)
  if ( blog.author.toString() === userid.toString() ){
    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  }
  else {
    return response.status(400).json({ error: 'this user didnt create the blog'})
  }
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