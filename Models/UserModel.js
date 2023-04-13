const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true, max: 20, unique: true },
    first_name: { type: String, required: true, trim: true, max: 30, text: true },
    last_name: { type: String, required: true, trim: true, max: 20, text: true },
    email: { type: String, default: '', trim: true },
    emailVerify: { type: Boolean, default: false },
    password: { type: String, required: true, trim: true },
    hobbies: [
        {
            title: { type: String, required: true },
            icon: { type: String, required: true }
        }
    ],
    featureImage: [{ type: String }],
    phone: { type: String, default: '' },
    picture: { type: String, default: "https://res.cloudinary.com/kajolroy/image/upload/v1654269448/facebook/default_image/user_u7qetf.png" },
    cover: { type: String, default: "https://res.cloudinary.com/kajolroy/image/upload/v1653506943/facebook/default_image/fb_cover_pr3fez.png" },
    gender: { type: String, required: true, trim: true },
    bYear: { type: Number, required: true, trim: true },
    bMonth: { type: Number, required: true, trim: true },
    bDay: { type: Number, required: true, trim: true },
    friends: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    request: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    requestTo: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    profileLock: { type: Boolean, default: false },
    work: [
        {
            desc: { type: String, trim: true },
            company: { type: String, trim: true },
            position: { type: String, trim: true },
        }
    ],
    search: [{ type: mongoose.Types.ObjectId }],
    details: {
        bio: { type: String, default: "" },
        highSchool: [
            {
                school: { type: String, trim: true },
            }
        ],
        collage: [
            {
                collage: { type: String, trim: true },

            }
        ],
        social: {
            youtube: { type: String, trim: true },
            twitter: { type: String, trim: true },
            instagram: { type: String, trim: true },
            linkedin: { type: String, trim: true },
            github: { type: String, trim: true },
            pinterest: { type: String, trim: true },
            tumbler: { type: String, trim: true },
            skype: { type: String, trim: true }
        },
        website: { type: String, default: '' },
        family: [
            {
                type: mongoose.ObjectId,
                ref: "User"
            }
        ],
        currentCity: {
            name: { type: String, trim: true, default: "" },
            access: { type: Boolean, default: true }
        },
        homeTown: {
            name: { type: String, trim: true, default: "" },
            access: { type: Boolean }
        },
        relationship: {
            type: String,
            default: "Single",
            enum: ['Single', 'In a Relationship', 'Married', 'Divorced']
        },
        savePost: [
            {
                postId: {
                    type: mongoose.Types.ObjectId,
                    ref: "Post"
                },
                saveAt: {
                    type: Date,
                    default: new Date()
                }
            }
        ]

    },
    other_name: {
        nickName: { type: String, trim: true },
        FathersName: { type: String, trim: true },
        birthName: { type: String, trim: true },
        marriedName: { type: String, trim: true },
        formerName: { type: String, trim: true },
        other: { type: String, trim: true }
    },
    setNameProfile: { type: String, trim: true },
    about: { type: String, trim: true, default: '' }


}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)