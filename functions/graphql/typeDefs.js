const gql = require('graphql-tag')

module.exports = gql `
type Post {
    id: ID!
    owner: String!
    text: String!
    createdAt: String!
    likeCount: Int!
    commentCount: Int!
}

type Query {
    getPosts: [Post]!
}
`