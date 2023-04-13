
const PostModel = require("../Models/PostModel")
const UserModel = require("../Models/UserModel")
const ReactModal = require("../Models/ReactModal")
const Cloudinary = require("cloudinary").v2


exports.getMyPost = async (req, res) => {
    const { username } = req.body
    try {
        const user = await UserModel.findOne({ username })
        const post = await PostModel.find({
            user: {
                $in: user._id
            }
        }).populate({
            path: 'user',
            model: UserModel,
            select: "-_id first_name last_name picture username"
        }).populate({
            path: "tag",
            model: UserModel,
            select: "-_id first_name last_name picture username"
        }).populate({
            path: "comments.commentedBy",
            model: UserModel,
            select: "username first_name last_name picture"
        }).sort({ createdAt: -1 })
        res.status(200).send(post)
    } catch (error) {
        res.status(500).send(error.message)
    }
}
//get followers Post
exports.getFollowersPost = async (req, res) => {

    try {
        const posts = await PostModel.find({
            user: {
                $in: [...req.user.followings, req.user._id]
            }
        }).populate({
            path: "user",
            model: UserModel,
            select: "-_id first_name last_name picture username",
        }).populate({
            path: "tag",
            model: UserModel,
            select: "-_id first_name last_name picture username"
        }).populate({
            path: "comments.commentedBy",
            model: UserModel,
            select: "username first_name last_name picture"
        }).sort({ createdAt: -1 })
        res.status(200).send(posts)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

// Create Post
exports.createPost = async (req, res) => {
    const { images, text, privacy, tag, felling, background, color } = req.body
    try {
        if (images) {
            let uploaded = []
            images.forEach(async (item) => {
                uploaded.push(
                    Cloudinary.uploader.upload(item, {
                        folder: `facebook/user/${req.user._id}/post_picture`
                    }))
            })
            const response = await Promise.all(uploaded)
            await PostModel.create({
                user: req.user._id,
                images: response.map(x => x.secure_url),
                text,
                privacy,
                tag,
                felling
            })
            res.status(200).send({ message: "Successfully created !!" })
        } else {
            await PostModel.create({
                user: req.user._id,
                background,
                color,
                text,
                privacy,
                tag,
                felling
            })
            res.status(200).send({ message: "Successfully created !!" })
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

// GEt Visit profile Post
exports.getVisitProPost = async (req, res) => {

    const { userId } = req.body
    const i = req.user
    try {
        const findUser = await UserModel.findById(userId)
        const findPost = await PostModel.find({ user: userId })
            .populate({
                path: "user",
                model: UserModel,
                select: "-_id first_name last_name picture username",
            }).populate({
                path: "tag",
                model: UserModel,
                select: "-_id first_name last_name picture username"
            }).populate({
                path: "comments.commentedBy",
                model: UserModel,
                select: "username first_name last_name picture"
            }).sort({ createdAt: -1 })
        if (i.friends.includes(userId)) {
            res.status(200).send(findPost)
        } else if (!findUser.profileLock) {
            res.status(200).send(findPost)
        } else {
            res.status(400).send({ message: "This profile is locked !!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

// Comment To Post
exports.commentToPost = async (req, res) => {
    const { image, text, postId, gif } = req.body
    try {
        if (image) {
            await Cloudinary.uploader.upload(image, {
                folder: `facebook/user/${req.user._id}/comments_picture`
            }, async (error, result) => {
                if (result) {
                    await PostModel.findByIdAndUpdate(postId, {
                        $push: {
                            comments: {
                                image: result.secure_url,
                                comment: text,
                                commentedBy: req.user._id,
                                createdAt: Date.now()
                            }
                        }
                    })
                    return res.status(200).send({ message: "Comment successfully !" })
                } else {
                    return res.status(400).send({ message: "Image upload failed !!" })
                }
            })
        } else if (gif) {
            await PostModel.findByIdAndUpdate(postId, {
                $push: {
                    comments: {
                        image: gif,
                        comment: text,
                        commentedBy: req.user._id,
                        createdAt: Date.now()
                    }
                }
            })
            return res.status(200).send({ message: "Comment successfully !" })
        } else {
            await PostModel.findByIdAndUpdate(postId, {
                $push: {
                    comments: {
                        comment: text,
                        commentedBy: req.user._id,
                        createdAt: Date.now()
                    }
                }
            })
            return res.status(200).send({ message: "Comment successfully !" })
        }

    } catch (error) {
        return res.status(400).send({ message: error.message })

    }
}

// Delete Post
exports.deletePost = async (req, res) => {

    const findPost = await PostModel.findById(req.params.postId)
    try {
        if (findPost.user.equals(req.user._id)) {
            await ReactModal.deleteMany({ postId: findPost._id })
            await PostModel.findByIdAndDelete(req.params.postId)
            res.status(200).send({ message: "Delete success !" })
        } else {
            res.status(400).send({ message: "Not allow to delete others post !" })
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}