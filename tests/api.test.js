const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { before } = require('lodash')



  

beforeEach(async () => {
    await User.deleteMany({})
    const user = {
        blogs: [],
        username: "mluukkai2",
        name: "mluukkai",
        password: "1212321"
    }

    await api
        .post(`/api/users`)
        .send(user)
        .expect(200)

    await Blog.deleteMany({})
   
})

test('blogs are returned as json', async () => {
    const userlogin = {
        username: "mluukkai2",
        password: "1212321"}

    const loginResult = await api
        .post(`/api/login`)  
        .send(userlogin)
        .expect(200)
    
    const newBlog = {
    title: 'newtitle',
    url: 'http://falsa.com',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + loginResult.body.token)
        .send(newBlog)
        .expect(200)
    
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })


test('number of blogs returned is correct', async () => {
    const userlogin = {
        username: "mluukkai2",
        password: "1212321"}

    const loginResult = await api
        .post(`/api/login`)  
        .send(userlogin)
        .expect(200)
    
    const newBlog = {
    title: 'newtitle',
    url: 'http://falsa.com',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + loginResult.body.token)
        .send(newBlog)
        .expect(200)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(1)
})  

test('check the id variable of blogs is defined as id', async () => {
    const userlogin = {
        username: "mluukkai2",
        password: "1212321"}

    const loginResult = await api
        .post(`/api/login`)  
        .send(userlogin)
        .expect(200)
    
    const newBlog = {
    title: 'newtitle',
    url: 'http://falsa.com',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + loginResult.body.token)
        .send(newBlog)
        .expect(200)
    
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})  




test('post succeeds with valid data', async () => {
    const userlogin = {
        username: "mluukkai2",
        password: "1212321"}

    const loginResult = await api
        .post(`/api/login`)  
        .send(userlogin)
        .expect(200)
    
    const newBlog = {
    title: 'newtitle',
    url: 'http://falsa.com',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + loginResult.body.token)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsInDb = async () => {
        const blogs = await Blog.find({})
        return blogs.map(blog => blog.toJSON())
    }

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(1)

    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
    'newtitle'
    )
})  



test('likes default is set to 0', async () => {
    const userlogin = {
        username: "mluukkai2",
        password: "1212321"}

    const loginResult = await api
        .post(`/api/login`)  
        .send(userlogin)
        .expect(200)
    
    const newBlog = {
    title: 'newtitle',
    url: 'http://falsa.com'
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + loginResult.body.token)
        .send(newBlog)
        .expect(200)
    
    const blogsInDb = async () => {
        const blogs = await Blog.find({})
        return blogs.map(blog => blog.toJSON())
    }

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(1)
    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
    'newtitle'
    )
    const filteredBlogs = blogsAtEnd.filter(blog => blog.title==='newtitle')
    expect(filteredBlogs[0].likes).toBe(0)
})

test('if title and url are missing you get 400 bad request', async () => {
    const userlogin = {
        username: "mluukkai2",
        password: "1212321"}

    const loginResult = await api
        .post(`/api/login`)  
        .send(userlogin)
        .expect(200)
    
    const newBlog = {
    author: 'david',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + loginResult.body.token)
        .send(newBlog)
        .expect(400)  

    const blogsInDb = async () => {
        const blogs = await Blog.find({})
        return blogs.map(blog => blog.toJSON())
    }

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(0)    

})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const userlogin = {
            username: "mluukkai2",
            password: "1212321"}
    
        const loginResult = await api
            .post(`/api/login`)  
            .send(userlogin)
            .expect(200)
        
        const newBlog = {
        title: 'newtitle',
        url: 'http://falsa.com',
        likes: 69
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + loginResult.body.token)
            .send(newBlog)
            .expect(200)
        
        
        const blogsInDb = async () => {
            const blogs = await Blog.find({})
            return blogs.map(blog => blog.toJSON())
        }

        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]
  
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', 'bearer ' + loginResult.body.token)
            .expect(204)

        const blogsAtEnd = await blogsInDb()

        expect(blogsAtEnd).toHaveLength(
        0
        )

        const titles = blogsAtEnd.map(r => r.title)

        expect(titles).not.toContain(blogToDelete.title)
    })
    test('fails with 401 unauthorized if not bearer token provided', async () => {
        const userlogin = {
            username: "mluukkai2",
            password: "1212321"}
    
        const loginResult = await api
            .post(`/api/login`)  
            .send(userlogin)
            .expect(200)
        
        const newBlog = {
        title: 'newtitle',
        url: 'http://falsa.com',
        likes: 69
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + loginResult.body.token)
            .send(newBlog)
            .expect(200)
        
        
        const blogsInDb = async () => {
            const blogs = await Blog.find({})
            return blogs.map(blog => blog.toJSON())
        }

        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]
  
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)

        const blogsAtEnd = await blogsInDb()

        expect(blogsAtEnd).toHaveLength(
        1
        )

        const titles = blogsAtEnd.map(r => r.title)

        expect(titles).toContain(blogToDelete.title)
    })
  }) 

describe('update a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
        const userlogin = {
            username: "mluukkai2",
            password: "1212321"}
    
        const loginResult = await api
            .post(`/api/login`)  
            .send(userlogin)
            .expect(200)
        
        const newBlog = {
        title: 'newtitle',
        url: 'http://falsa.com',
        likes: 15
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + loginResult.body.token)
            .send(newBlog)
            .expect(200)
        
        const blogsInDb = async () => {
            const blogs = await Blog.find({})
            return blogs.map(blog => blog.toJSON())
        }

        const blogsAtStart = await blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlog = {
            likes: 69
            }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', 'bearer ' + loginResult.body.token)
            .send(updatedBlog)
            .expect(200)

        const blogsAtEnd = await blogsInDb()

        expect(blogsAtEnd).toHaveLength(
        1
        )

        const filteredBlogs = blogsAtEnd.filter(blog => blog.title===blogToUpdate.title)
        expect(filteredBlogs[0].likes).toBe(69)
    })
})  

afterAll(() => {
mongoose.connection.close()
})