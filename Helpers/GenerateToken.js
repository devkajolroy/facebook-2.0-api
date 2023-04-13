const Jwt = require("jsonwebtoken")
const UserModel = require("../Models/UserModel")

exports.generateToken = (username) => {
    return Jwt.sign({ username }, process.env.JWT_KEY, {
        expiresIn: "90d"
    })
}


exports.refreshToken = async (req, res) => {

    const { first_name, last_name, username, picture } = req.user
    try {
        res.status(200).send({
            first_name, last_name, username, picture,
            token: this.generateToken(username)
        })
    } catch (error) {
        res.status(200).send({ message: error.message })
    }
}