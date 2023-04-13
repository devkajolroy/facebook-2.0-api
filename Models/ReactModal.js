const mongoose = require("mongoose")

const reactSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Types.ObjectId,
        ref: "posts"
    },
    reactBy: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    reactType: {
        type: String,
        enum: ["like", "love", 'haha', "angry", "wow", "sad", "care"],
        default: "like"
    }
}, { timestamps: true })
module.exports = mongoose.model("reacts", reactSchema)