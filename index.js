const express = require("express")
const dotenv = require("dotenv")
const db = require("./models")
const { Op } = require("sequelize")

dotenv.config()

const PORT = 2000

const app = express()

app.use(express.json())

const expensesRoute = require("./routes/expensesRoute")
const authRoute = require("./routes/authRoute")
const { verifyToken } = require("./middleware/authMiddleware")
const { useRoutes } = require("react-router-dom")

app.use("/expenses", verifyToken, expensesRoute)
app.use("/auth", authRoute)

app.listen(PORT, () => {
  db.sequelize.sync({ alter: true })
  console.log("Listening in port", PORT)
})
