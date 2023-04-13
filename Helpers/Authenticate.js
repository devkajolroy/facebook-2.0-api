const Jwt = require("jsonwebtoken")
const UserModel = require("../Models/UserModel")

exports.private = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const decode = Jwt.verify(token, process.env.JWT_KEY)
            const user = await UserModel.findOne({ username: decode.username })
            if (user) {
                req.user = user
                next()
            } else {
                res.status(401).send({ message: "User not found !!" })
            }
        } catch (error) {
            res.status(401).send({ message: "Login expire login agin !" })
        }
    } else {
        res.status(401).send({ message: "Please login first !" })
    }
}