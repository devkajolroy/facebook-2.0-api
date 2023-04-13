const mongoose = require("mongoose")

exports.mongoConnect = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Database connected"))
        .catch((err) => console.log(err))
}
