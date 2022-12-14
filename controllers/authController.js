const { Op } = require("sequelize")
const db = require("../models")
const bcrypt = require("bcrypt")
const { signToken } = require("../lib/jwt")

const User = db.User

const authController = {
  registerUser: async (req, res) => {
    // 1. Check username and email, harus unik
    // 2. Daftarkan

    try {
      const { username, email, password } = req.body

      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username,
            email,
          },
        },
      })

      if (findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "Username or email has been used",
        })
      }

      const hashedPassword = bcrypt.hashSync(password, 5)

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      })

      return res.status(201).json({
        message: "User registered",
        data: newUser,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: "Server error",
      })
    }
  },
  loginUser: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body

      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username: usernameOrEmail,
            email: usernameOrEmail,
          },
        },
      })

      if (!findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "User not found",
        })
      }

      const passwordValid = bcrypt.compareSync(
        password,
        findUserByUsernameOrEmail.password
      )

      if (!passwordValid) {
        return res.status(400).json({
          message: "Password invalid",
        })
      }

      // Hapus property password dari object yang akan dikirim
      // sebagai response
      delete findUserByUsernameOrEmail.dataValues.password

      const token = signToken({
        id: findUserByUsernameOrEmail.id,
      })

      return res.status(201).json({
        message: "Login user",
        data: findUserByUsernameOrEmail,
        token,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: "Server error",
      })
    }
  },
  refreshToken: async (req, res) => {},
}

module.exports = authController
