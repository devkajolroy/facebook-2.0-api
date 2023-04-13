const UserModel = require("../Models/UserModel")

exports.validEmail = (email) => {
    return email.toLowerCase().match(
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    )
}
exports.validPhone = (phone) => {
    return phone.match(
        /^[0-9]*$/
    )
}

// Check UTF-8 Language Name
exports.checkAlphabet = (username) => {
    return username.match(
        /^[a-zA-Z]+$/
    )
}
// Generate English Name to Username
exports.nameToRandomUsername = async (username) => {

    let x = false
    do {
        const user = await UserModel.findOne({ username })
        if (user) {
            username = username + "." + Math.random().toString(30).slice(3, 8)
            x = true
        } else {
            x = false
        }
    } while (x)

    return username
}
// Generate Other Language to English username
exports.randomAlphabetName = async () => {

    let x = false
    let username = Math.random().toString(30).slice(3, 12)
    do {
        const user = await UserModel.findOne({ username })
        if (user) {
            x = true
            username = username + "." + Math.random().toString(30).slice(3, 7)
        } else {
            x = false
        }
    } while (x)
    return username
}
