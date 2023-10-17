const userService = require('../service/UserService');

async function signupHandler(req, res, next) {
    try {
        await userService.signup(req.body);
        res.status(200).json({message: 'User created successfully'});
    }
    catch (error) {
        res.status(400).json({error: 'User already exists or error creating use'});
    }
}

module.exports = {
    signupHandler
}