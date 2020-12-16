const {db} = require('../../utility/admin')

const FBAuthContext = require('../../utility/FBAuthContext')
const { AuthenticationError, UserInputError } = require('apollo-server-express')


module.exports = {
        Query : {
            async getPosts(){
                try{
                    const posts = []
                    await db.collection('posts').get()
                        .then(data => {
                            data.forEach(doc => {
                                console.log(doc.data());
                                posts.push({
                                    id: doc.data().id,
                                    text: doc.data().text,
                                    owner: doc.data().owner,
                                    createdAt: doc.data().createdAt,
                                    likeCount: doc.data().likeCount,
                                    commentCount: doc.data().commentCount
                                })
                            })
                        })
                        
                    return posts
    
                }
                catch(err){
                    console.log(err);
                    throw new Error(err)
                }
            },
            
            // async getPost() {

            // }
        },
        Mutation: {
            async createPost(_, { text }, context) {
                const {username} = await FBAuthContext(context)

                if(user){
                    try{
                        const newPost = {
                            owner: username,
                            text,
                            createdAt: new Date().toISOString(),
                            likeCount: 0,
                            commentCount: 0
                        }
    
                        await db.collection('posts').add(newPost)
                            .then(doc => {
                                newPost.id = doc.id
                            })
                        console.log(newPost);
                        return newPost
                    }
                    catch(err){
                        console.log(err);
                        throw new Error(err)
                    }
                }

            },
            async deletePost(_, { id }, context){
                const {username} = await FBAuthContext(context)
                const document = db.doc(`/posts/${id}`)

                try{
                    await document.get()
                        .then(doc => {
                            if(!doc.exists){
                                throw new AuthenticationError('Postingan tidak ditemukan')
                            }
                            if(doc.data().owner !== username){
                                throw new AuthenticationError('Unauthorized! Anda menghapus postingan yang bukan milik anda')
                            } else {
                                document.delete()
                            }
                        })
                        return 'Postingan telah dihapus'
                }
                catch(err){
                    console.log(err);
                    throw new UserInputError(err)
            }
        }
    }
}
            
