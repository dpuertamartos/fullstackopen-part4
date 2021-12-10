const middleware = require('../utils/middleware')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('author', {username: 1, name: 1}).populate('comment', {content: 1}).exec()
    response.json(blogs)
})
 

blogsRouter.post('/', middleware.userExtractor , async (request, response) => {
  const userid = request.userid
  const user = await User.findById(userid)
  
  const blog = new Blog({
    title: request.body.title,
    author: user._id,
    url: request.body.url,
    likes: request.body.likes,
    writer: request.body.writer
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
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

blogsRouter.post('/:id/comments', middleware.userExtractor , async (request, response) => {
  const userid = request.userid
  const blogid = request.params.id
  const blog = await Blog.findById(blogid)
  const user = await User.findById(userid)
  
  const comment = new Comment({
    content: request.body.content,
    author: user._id,
    blog: blog._id,
  })

  const savedComment = await comment.save()

  if(!blog.comment){
    const blogToUpdate = { comment: savedComment._id}
    await Blog.findByIdAndUpdate(blogid, blogToUpdate, {new: true})
  }
  else{  
    const blogToUpdate = { comment: blog.comment.concat(savedComment._id)}
    await Blog.findByIdAndUpdate(blogid, blogToUpdate, {new: true})
  }
  response.json(savedComment)
})

module.exports = blogsRouter