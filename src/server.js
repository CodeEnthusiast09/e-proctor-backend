const express = require("express");
const cors = require("cors");
const pool = require("../src/db");
const sessions = require("express-session");
require("dotenv").config();
const examinerAuth = require("./examinerAuthRoutes");
const questionRoute = require("./questionsRoute");
const studentAuth = require("./StudentAuthRoutes");
const enrollments = require("./enrollmentRoute")

const app = express();

const corsOptions = {
  origin: "http://localhost:3001",
  optionsSuccessStatus: 200,
  credentials: true, // make sure cookies are sent
};

app.use(cors(corsOptions));

app.use(
  sessions({
    name: "O'Brien",
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 3600000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
    resave: true,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// @todo register routes

app.use("/api/auth", examinerAuth);
app.use("/api/exams", questionRoute);
app.use("/api/auth2", studentAuth);
app.use("/api/students", enrollments);

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected:", res.rows);
  }
});

app.get("/", (req, res) => res.send("Better Work!"));

app.listen(4000, () => {
  console.log(`Server Running at port 4000`);
});
