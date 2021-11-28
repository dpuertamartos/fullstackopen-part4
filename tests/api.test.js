const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

const initialBlogs = [ { _id: "5a422a851b54a676234d17f7", title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7, __v: 0 },
{ _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 }, 
{ _id: "5a422b3a1b54a676234d17f9", title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12, __v: 0 }, 
{ _id: "5a422b891b54a676234d17fa", title: "First class tests", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 10, __v: 0 }, 
{ _id: "5a422ba71b54a676234d17fb", title: "TDD harms architecture", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", likes: 0, __v: 0 }, 
{ _id: "5a422bc61b54a676234d17fc", title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 }
]

beforeEach(async () => {
    await Blog.deleteMany({})
  
    for (let blog of initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
})

test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })


test('number of blogs returned is correct', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length)
})  

test('check the id variable of blogs is defined as id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})  


test('post succeeds with valid data', async () => {
    const newBlog = {
    title: 'newtitle',
    author: 'david',
    url: 'http://falsa.com',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsInDb = async () => {
        const blogs = await Blog.find({})
        return blogs.map(blog => blog.toJSON())
    }

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
    'newtitle'
    )
})  

test('likes default is set to 0', async () => {
    const newBlog = {
        title: 'newtitle',
        author: 'david123123',
        url: 'http://falsa.com'
        }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/) 
    
    const blogsInDb = async () => {
        const blogs = await Blog.find({})
        return blogs.map(blog => blog.toJSON())
    }

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
    'newtitle'
    )
    const filteredBlogs = blogsAtEnd.filter(blog => blog.author==='david123123')
    expect(filteredBlogs[0].likes).toBe(0)
})

test('if title and url are missing you get 400 bad request', async () => {
    const newBlog = {
    author: 'david',
    likes: 69
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)  

    const blogsInDb = async () => {
        const blogs = await Blog.find({})
        return blogs.map(blog => blog.toJSON())
    }

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(initialBlogs.length)    

})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsInDb = async () => {
            const blogs = await Blog.find({})
            return blogs.map(blog => blog.toJSON())
        }

        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]
  
        await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

        const blogsAtEnd = await blogsInDb()

        expect(blogsAtEnd).toHaveLength(
        initialBlogs.length - 1
        )

        const titles = blogsAtEnd.map(r => r.title)

        expect(titles).not.toContain(blogToDelete.title)
    })
  })

describe('update a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
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
            .send(updatedBlog)
            .expect(200)

        const blogsAtEnd = await blogsInDb()

        expect(blogsAtEnd).toHaveLength(
        initialBlogs.length
        )

        const filteredBlogs = blogsAtEnd.filter(blog => blog.title===blogToUpdate.title)
        expect(filteredBlogs[0].likes).toBe(69)
    })
})    


  
afterAll(() => {
mongoose.connection.close()
})