const _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const blogsLikes = blogs.map(blog => blog.likes)
    const reducer = (sum, item) => {
        return sum + item
    }
    return blogsLikes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const blogLikes = blogs.map(blog => blog.likes)
    const i = blogLikes.indexOf(Math.max(...blogLikes))
    return blogs[i]
}

const mostBlogs = (blogs) => {
    const blogAuthor = blogs.map(blog => blog.author)
    const result = _.head(
        _(blogAuthor)
        .countBy()
        .entries()
        .maxBy(_.last)
        )    
    return result
}

const mostLikes = (blogs) => {
    let authorLikes = blogs.reduce((op, {author, likes}) => {
        op[author] = op[author] || 0
        op[author] += likes
        return op
      },{}) 
    const maxKey = _.maxBy(_.keys(authorLikes), function (o) { return authorLikes[o]; });
    return maxKey
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}