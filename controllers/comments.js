/* const middleware = require('../utils/middleware')
const commentsRouter = require('express').Router()
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const User = require('../models/user')

commentsRouter.post('/:id/comments', middleware.userExtractor , async (request, response) => {
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
    blog.comment = blog.comment.concat(savedComment._id)
    await blog.save()
    response.json(savedComment)
  }) */