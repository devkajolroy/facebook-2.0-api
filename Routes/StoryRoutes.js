const Router = require("express").Router()
const { createStory, getStory, deleteStory } = require("../Controller/StoryController")
const { private } = require("../Helpers/Authenticate")

Router.route("/story")
    .post(private, createStory)
    .get(private, getStory)
    .delete(private, deleteStory)


module.exports = Router