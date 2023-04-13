const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    type: { type: String, enum: ["profile", "cover", null], default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    background: { type: String },
    color: { type: String, default: "white", enum: ["white", "black"] },
    privacy: { type: String, enum: ["public", "private", "friends", "onlyme"] },
    felling: {
        title: { type: String },
        icon: { type: String }
    },
    images: { type: Array, default: [] },
    tag: { type: Array, ref: "users" },
    comments: [{
        comment: { type: String },
        image: { type: String },
        commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        createdAt: { type: Date, required: true }
    }],
    text: { type: String, default: '' }
}, { timestamps: true })
module.exports = mongoose.model("Posts", postSchema)