const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
})

describe('create a user', () => {
    test('200 from succesful creation of user', async () => {
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
        
        const usersInDb = async () => {
            const users = await User.find({})
            return users.map(user=> user.toJSON())
        }    
        const blogsAtEnd = await usersInDb()

        expect(blogsAtEnd).toHaveLength(1)
    })
    test('400 from no username creation of user', async () => {
        const user = {
            blogs: [],
            name: "mluukkai",
            password: "1212321"
        }
        await api
            .post(`/api/users`)
            .send(user)
            .expect(400)
        
        const usersInDb = async () => {
            const users = await User.find({})
            return users.map(user=> user.toJSON())
        }    
        const blogsAtEnd = await usersInDb()

        expect(blogsAtEnd).toHaveLength(0)
    })
    test('400 from less than 3 char username', async () => {
        const user = {
            blogs: [],
            username: "ml",
            name: "mluukkai",
            password: "1212321"
        }
        await api
            .post(`/api/users`)
            .send(user)
            .expect(400)
        
        const usersInDb = async () => {
            const users = await User.find({})
            return users.map(user=> user.toJSON())
        }    
        const blogsAtEnd = await usersInDb()

        expect(blogsAtEnd).toHaveLength(0)
    })
    test('400 from less than 3 char pass', async () => {
        const user = {
            blogs: [],
            username: "ml",
            name: "mluukkai",
            password: "12"
        }
        await api
            .post(`/api/users`)
            .send(user)
            .expect(400)
        
        const usersInDb = async () => {
            const users = await User.find({})
            return users.map(user=> user.toJSON())
        }    
        const blogsAtEnd = await usersInDb()

        expect(blogsAtEnd).toHaveLength(0)
    })
    test('400 from no password', async () => {
        const user = {
            blogs: [],
            username: "ml",
            name: "mluukkai"
        }
        await api
            .post(`/api/users`)
            .send(user)
            .expect(400)
        
        const usersInDb = async () => {
            const users = await User.find({})
            return users.map(user=> user.toJSON())
        }    
        const blogsAtEnd = await usersInDb()

        expect(blogsAtEnd).toHaveLength(0)
    })        
})    

  
afterAll(() => {
mongoose.connection.close()
})