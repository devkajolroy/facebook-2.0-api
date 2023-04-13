const UserModel = require("../Models/UserModel")
const bcrypt = require("bcrypt")
const { generateToken } = require("../Helpers/GenerateToken")
const { validEmail, validPhone, randomAlphabetName, nameToRandomUsername, checkAlphabet } = require("../Helpers/Validation")

//Register
exports.registration = async (req, res) => {

    const { first_name, surname, mobileOrEmail, gender, bYear, bMonth, bDay, password } = req.body

    if (!mobileOrEmail || !first_name || !surname || !gender || !bYear || !bDay || !bMonth || !password) {
        res.status(400).send({ message: "Invalid register information" })
    } else {

        try {
            const findPhone = await UserModel.findOne({ phone: mobileOrEmail.trim() })
            const findEmail = await UserModel.findOne({ email: mobileOrEmail.toLowerCase().trim() })
            const encryptPass = await bcrypt.hash(password.toString(), 10)

            // Username Generator
            let nameToUsername
            const namePlus = first_name.trim() + "." + surname.trim()
            if (!checkAlphabet(first_name.trim())) {
                nameToUsername = await randomAlphabetName()
            } else {
                nameToUsername = await nameToRandomUsername(namePlus.toLowerCase())
            }


            if (findPhone || findEmail) {
                res.status(400).send({ message: "User already registered !!" })
            } else if (!validPhone(mobileOrEmail) && !validEmail(mobileOrEmail)) {
                res.status(400).send({ message: "Email or phone is wrong !!" })
            }
            else {

                if (!validEmail(mobileOrEmail)) {
                    const newUser = await UserModel.create({
                        first_name, last_name: surname, phone: mobileOrEmail.trim(),
                        gender, bDay, bMonth, bYear, password: encryptPass,
                        username: nameToUsername
                    })
                    res.status(201).send({
                        picture: newUser.picture,
                        first_name: newUser.first_name,
                        last_name: newUser.last_name,
                        token: generateToken(newUser.username),
                        username: newUser.username,
                        _id: newUser._id,
                    })
                } else {
                    const createUser = await UserModel.create({
                        first_name, last_name: surname, email: mobileOrEmail.toLowerCase().trim(),
                        gender, bDay, bMonth, bYear, password: encryptPass,
                        username: nameToUsername
                    })
                    res.status(201).send({
                        _id: createUser._id,
                        picture: createUser.picture,
                        first_name: createUser.first_name,
                        username: createUser.username,
                        last_name: createUser.last_name,
                        token: generateToken(createUser.username)
                    })
                }

            }
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }
}


// Login
exports.login = async (req, res) => {
    const { emailPhoneUsername, password } = req.body

    if (!emailPhoneUsername || !password) {
        res.status(400).send({ message: "Invalid login information !!" })
    } else {
        try {
            const findName = await UserModel.findOne({ username: emailPhoneUsername })
            const findPhone = await UserModel.findOne({ phone: emailPhoneUsername.trim() })
            const findEmail = await UserModel.findOne({ email: emailPhoneUsername.toLowerCase().trim() })
            const findUser = findName || findPhone || findEmail
            if (findUser && await bcrypt.compare(password.toString(), findUser.password)) {
                res.status(200).send({
                    _id: findUser._id,
                    picture: findUser.picture,
                    first_name: findUser.first_name,
                    username: findUser.username,
                    last_name: findUser.last_name,
                    token: generateToken(findUser.username)
                })
            } else {
                res.status(401).send({ message: "Email or Password is wrong !!" })
            }

        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }
}



