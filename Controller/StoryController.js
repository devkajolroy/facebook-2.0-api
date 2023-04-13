const StoryModel = require("../Models/StoryModel")
const Cloudinary = require("cloudinary").v2
const UserModel = require("../Models/UserModel")

exports.createStory = async (req, res) => {
    const { image } = req.body
    try {
        Cloudinary.uploader.upload(image, {
            unique_filename: true,
            folder: `facebook/user/${req.user._id}/story_picture`,
        }, async (error, result) => {
            if (result) {
                await StoryModel.create({
                    user: req.user._id,
                    image: result.secure_url
                })
                res.status(200).send({ message: "Story created !" })
            }
            if (error) {
                res.status(400).send({ message: error.message })
            }
        })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

exports.getStory = async (req, res) => {
    try {
        const findStory = await StoryModel.find({
            user: {
                $in: [...req.user.friends, req.user._id]
            },
            createdAt: { $gt: new Date(Date.now() - 86400000 * 2) }
        }).populate({
            path: "user",
            model: UserModel,
            select: "username first_name last_name picture"
        })
        res.status(200).send(findStory)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

// DElete Story
exports.deleteStory = async (req, res) => {
    const { storyId } = req.body
    try {
        await StoryModel.findByIdAndDelete(storyId)
        res.status(200).send({ message: "Story deleted !" })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

