module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword
) => {
    const errors = {};
    if(username.trim() === '') {
        errors.username = 'Username tidak boleh kosong';
    }
    if(email.trim() === '') {
        errors.username = 'Email tidak boleh kosong';
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Format email tidak valid'
        }
    }
    if (password === '') {
        errors.password = 'Password tidak boleh kosong';
    } else if ( password !== confirmPassword) {
        errors.confirmPassword = 'Password tidak sesuai'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
};

module.exports.validateRegisterInput = (username, password) => {
    const errors = {};
    if(username.trim() === '') {
        errors.username = 'Username tidak boleh kosong';
    }
    if(password.trim() === '') {
        errors.password = 'Password tidak boleh kosong';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
};