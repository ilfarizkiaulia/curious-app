const gql = require('graphql-tag')

module.exports = gql `
################## Type ################
type Post {
    id: ID!
    owner: String!
    text: String!
    createdAt: String!
    likeCount: Int!
    commentCount: Int!
    comments: [Comment]
}

type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    profilePicture: String
    token: String!
}

type Comment {
    id: ID!
    owner: String!
    createdAt: String!
    text: String!
}

################## Queries ################
type Query {
    getPosts: [Post]!
    getPost(id: String!) : Post!
}

################## Input ################
input RegisterInput{
    username: String!
    password: String!
    confirmPassword: String
    email: String!
}
type Mutation {
    # Users Mutation
    registerUser(registerInput: RegisterInput) : User!
    login(username: String!, password: String!) : User!

    # Posts Mutation
    createPost( text: String!) : Post!
    deletePost(id: String!) : String!
    likePost(id: ID!) : Post!

    # Comments Mutation
    createComment( id: ID!, text: String!) : Comment!
    deleteComment( commentId: ID!) : String!
}
`