const express = require("express")

const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const path = require("path")
const User = require("./models/User")
const jwt = require("jsonwebtoken")
var cors = require("cors")

require("dotenv/config")

const port = process.env.PORT || 8080
const app = express()

app.use(
  "/api",
  cors({
    origin: "localhost:" + port,
    methods: ["GET", "POST", "OPTIONS"],
    optionsSuccessStatus: 200,
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser(process.env.SECRET))

const authRoute = require("./routes/auth")
const userRoute = require("./routes/user")
const walletRoute = require("./routes/wallet")
const adminRoute = require("./routes/admin")

app.use("/api/auth", authRoute)
app.use("/api/user", userRoute)
app.use("/api/wallet", walletRoute)
app.use("/api/admin", adminRoute)

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.on("error", (err) => {
  console.log("Database has " + db.states[+db._readyState])
})

db.once("open", () => {
  console.log("Database has " + db.states[+db._readyState])
})

app.use("/", express.static(path.join(__dirname, "../site/dist")))
app.use(express.static(path.join(__dirname, "../admin/dist")))

app.get(/(?!\/api)\/admin(\/.*|$)/, (req, res) => {
  try {
    const token = req.cookies["Authorization"].split(" ")[1]
    const userId = jwt.verify(token, process.env.SECRET).user

    User.findById(userId, (err, match) => {
      if (["admin", "manager"].includes(match.role.name)) {
        res.sendFile(path.join(__dirname, "../admin/dist/index.html"))
      } else {
        res.sendFile(path.join(__dirname, "../site/dist/index.html"))
      }
    })
  } catch (err) {
    res.sendFile(path.join(__dirname, "../site/dist/index.html"))
  }
})

app.get(/.+(?!\/admin(\/.*|$))/, (req, res) => {
  res.sendFile(path.join(__dirname, "../site/dist/index.html"))
})

app.listen(port, () => console.log(`Server is running on ${port}...`))
