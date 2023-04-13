const Router = require("express").Router()
const { registration, login, test } = require("../Controller/AuthController")
const { refreshToken } = require("../Helpers/GenerateToken")
const { nameToRandomUsername } = require("../Helpers/Validation")
const { private } = require("../Helpers/Authenticate")

Router.post("/register", registration)
Router.post("/login", login)
Router.get("/refresh", private, refreshToken)
Router.post("/test", async (req, res) => {
    res.send("Test")
})




module.exports = Router