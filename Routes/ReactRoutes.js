const Router = require("express").Router()
const { getPostReact, react } = require("../Controller/ReactController")
const { private } = require("../Helpers/Authenticate")


Router.put("/react", private, react)
Router.post("/react", private, getPostReact)








module.exports = Router