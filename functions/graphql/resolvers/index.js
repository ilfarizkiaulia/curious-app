const postResolvers = require('./posts')
const commentResolvers = require('./comments')
const userResolvers = require('./users')

module.exports = {
    Query : {
        ...postResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentResolvers.Mutation
    }
}