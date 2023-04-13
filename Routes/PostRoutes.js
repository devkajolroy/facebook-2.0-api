const Routes = require("express").Router()
const { getMyPost, getFollowersPost, createPost, getVisitProPost, commentToPost, deletePost } = require("../Controller/PostController")
const { private } = require("../Helpers/Authenticate")

Routes.post("/my_post", private, getMyPost)
Routes.get("/follower_post", private, getFollowersPost)
Routes.post("/create_post", private, createPost)
Routes.post("/visit_post", private, getVisitProPost)
Routes.put("/comment", private, commentToPost)
Routes.delete("/delete/:postId", private, deletePost)









module.exports = Routes