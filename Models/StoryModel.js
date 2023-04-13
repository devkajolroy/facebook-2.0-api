const mongoose = require("mongoose")

const StorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("story", StorySchema)