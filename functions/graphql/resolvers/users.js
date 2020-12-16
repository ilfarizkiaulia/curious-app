const { UserInputError, buildSchemaFromTypeDefinitions } = require('apollo-server-express')
const encrypt = require('bcrypt')

const {db} = require('../../utility/admin')
const firebase = require('firebase')
const config = require('../../utility/config')


const { validateRegisterInput, registerLoginInput } = require('../../utility/validators')
const { responsePathAsArray } = require('graphql')


firebase.initializeApp(config)

function generateToken(user){
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        }
    )
}
module.exports = {
    Mutation : {
        async login(_, {username, password}){

            const { valid, errors } = registerLoginInput(username, password)
            if(!valid) throw new UserInputError('Errors', { errors })

            try{
                const { id, email, createdAt } = await db.doc(`/users/${username}`).get()
                                                    .then(doc => {
                                                        if(!doc.exists){
                                                            throw new UserInputError('Username tidak diketemukan', {
                                                                errors: {username: 'Username tidak ditemukan'}
                                                            })
                                                        } else {
                                                            return doc.data()
                                                        }
                                                    })
                const token = await firebase.auth().signInWithEmailAndPassword(email,password)
                            .then( data => data.user.getIdToken() )
                            .then( idToken => idToken)
                
                return {
                    username,
                    id,
                    email,
                    createdAt,
                    token
                }
            }
            catch(err){
                        if (err.code === 'auth/invalid-email') {
                            throw new UserInputError('Email pengguna tidak ditemukan')
                        }
                        if (err.code === 'auth/wrong-password') {
                            throw new UserInputError('Password salah! Coba lagi')
                        }
                        throw new Error(err)
                    }

        },
        // async login(_, args){
        //     const { username, password } = args

        //     const { valid, errors } = registerLoginInput(username, password)

        //     if(!valid) throw new UserInputError('Errors', { errors })

        //     let login = {
        //         username,
        //     }
        //     try {
        //         await db.doc(`/users/${username}`).get()
        //         .then(doc => {
        //             if(!doc.exists){
        //                 return firebase.auth().signInWithEmailAndPassword(username, password)
        //                 }
        //             else {
        //                 login.createdAt = doc.data().createdAt
        //                 login.email = doc.data().email
        //                 login.profilePicture = doc.data().profilePicture
        //                 return firebase.auth().signInWithEmailAndPassword(login.email, password)
        //                 }
        //             })
        //             .then(data => {
        //                 login.id = data.user.uid
        //                 return data.user.getIdToken()
        //             })
        //             .then(idToken => {
        //                 login.token = idToken
        //             })
        //             console.log(login);
        //             return login
        //         }
        //     catch(err){
        //         if (err.code === 'auth/invalid-email') {
        //             throw new UserInputError('Email pengguna tidak ditemukan')
        //         }
        //         if (err.code === 'auth/wrong-password') {
        //             throw new UserInputError('Password salah! Coba lagi')
        //         }
        //         throw new Error(err)
        //     }
        // },

// Registration
        async registerUser(_, args, context,){
            const { registerInput: { username, email, password, confirmPassword }} = args
            console.log(username, email, password, confirmPassword);

            // TODO: Cek apakah data user sudah pernah daftar ke firestore
            // TODO: Simpan data yang user input ke Firestore
            // TODO: Daftarkan user dengan data yang diinput ke Firebase Auth

            // TODO: Cek apakah user menginput data dengan benar -> Buat validator function

            // User input error checking
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)

            if(!valid) throw new UserInputError('Errors', { errors })
            
            let newUser = {
                username,
                email,
                createdAt: new Date().toISOString(),
                profilePicture: 'Link ke foto profile'
            }

            const hash = await encrypt.hash(password, 12)

            try {
                await db.doc(`/users/${username}`).get()
                .then(doc => {
                    if(doc.exist){
                        throw new UserInputError('Username tidak tersedia', {
                            errors: { username: 'username tidak tersedia'}
                        })
                    }
                    else {
                        return firebase.auth().createUserWithEmailAndPassword(email, password)
                    }
                })
                .then(data => {
                    newUser.id = data.user.uid
                    return data.user.getIdToken()
                })
                .then(idToken => {
                    newUser.token = idToken

                    const saveUserData = {
                        id: newUser.id,
                        username,
                        email,
                        createdAt: new Date().toISOString(),
                        profilePicture: newUser.profilePicture,
                        _private: []
                    }

                    saveUserData._private.push({
                        hash,
                        lastUpdate: new Date().toISOString()
                    })

                    return db.doc(`/users/${username}`).set(saveUserData)
                })
                return newUser
            }
            catch(err){
                console.log(err)
                throw new Error(err)
            }
        }
    }
}

