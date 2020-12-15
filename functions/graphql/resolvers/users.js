const { UserInputError } = require('apollo-server-express')
const encrypt = require('bcrypt')

const {db} = require('../../utility/admin')
const firebase = require('firebase')
const config = require('../../utility/config')


const { validateRegisterInput, registerLoginInput } = require('../../utility/validators')


firebase.initializeApp(config)

module.exports = {
    Mutation : {
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