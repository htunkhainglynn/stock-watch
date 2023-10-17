const bcrypt = require('bcrypt');
const User = require('../model/User');

async function signup(body) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const user = new User({
        username: body.username,
        email: body.email,
        password: hashedPassword
    });
    await user.save();
}

module.exports = {
    signup
}
