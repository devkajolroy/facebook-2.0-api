const PostModel = require("../Models/PostModel")
const ReactModal = require("../Models/ReactModal")
const UserModel = require("../Models/UserModel")


// React Controller
exports.react = async (req, res) => {
    const { postId, reactType } = req.body
    try {
        const findReact = await ReactModal.findOne({ postId, reactBy: req.user._id })
        if (!findReact) {
            await ReactModal.create({ postId, reactBy: req.user._id, reactType })
            res.status(200).send({ message: "React successfully !" })
        } else {
            if (findReact.reactType != reactType) {
                await ReactModal.findOneAndUpdate({ postId }, {
                    $set: { reactType }
                })
                res.status(200).send({ message: "React updated !" })
            } else {
                await ReactModal.findOneAndRemove({ reactBy: req.user._id })
                res.status(200).send({ message: "React removed !" })
            }
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

// Get Post React
exports.getPostReact = async (req, res) => {
    const { postId } = req.body
    try {
        const reacts = await ReactModal.find({ postId }).populate({
            path: "reactBy",
            select: 'username _id first_name last_name picture _id',
            model: UserModel
        })
        res.status(200).send(reacts)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}


