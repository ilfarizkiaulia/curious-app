const {db} = require('../../utility/admin')

const FBAuthContext = require('../../utility/FBAuthContext')
const { AuthenticationError, UserInputError } = require('apollo-server-express')

module.exports = {
    Mutation: {
        async createComment(_, { id , text }, context){
            const { username } = await FBAuthContext(context)

            const postDocument = db.doc(`/posts/${id}`)
            const commentDocument = db.collection(`/posts/${id}/comments`)

            if(text.trim() === ''){
                throw new UserInputError('Kamu tidak bisa membuat comment tanpa text', {error: { text: 'Kamu tidak bisa membuat comment tanpa text'}})
            }

            try{
                const newComment = {
                    owner: username,
                    text,
                    createdAt: new Date().toISOString(),
                    likeCount: 0,
                    commentCount: 0
                }
                await postDocument.get()
                    .then(doc => {
                        if(!doc.exists){
                            throw new UserInputError('Postingan tidak ditemukan/sudah dihapus')
                        }
                        else{
                            return commentDocument.add(newComment)
                        } 
                    })
                    .then(doc => {
                        newComment.id = doc.id
                        doc.update({ id: doc.id })
                    })
                    return newComment
            }
            catch(err){
                console.log(err);
                throw new Error(err)
            }
        },
        async deleteComment(_, {id, commentId}, context){
            const { username } = await FBAuthContext(context)

            const postDocument = db.doc(`/posts/${id}`)
            const commentDocument = db.doc(`/posts/${id}/comments/${commentId}`)

            try{
                await postDocument.get()
                    .then(doc => {
                        if(!doc.exists){
                            throw new UserInputError('Postingan tidak ditemukan/sudah dihapus')
                        } 
                        else{
                            return commentDocument.get()
                        }
                    })
                    .then(doc => {
                        if(!doc.exists){
                            throw new UserInputError('Postingan tidak ditemukan/sudah dihapus')
                        } 
                        if(doc.data().owner !== username){
                            throw new UserInputError('Unauthorized!')
                            } else {
                                commentDocument.delete()
                                postDocument.update({ commentCount: doc.data().commentCount -1})
                            }
                        })
                        return 'Comment telah dihapus'
                        }
                        catch(err){
                            console.log(err);
                            throw new Error(err)
                        }
        }
    }
}