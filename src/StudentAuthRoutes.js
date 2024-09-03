const express = require("express");
const pool = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const router = express.Router();

// sign up route
router.post("/signup", async (req, res) => {
  const { firstName, lastName, department, level, matric_number, password } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO students (first_name, last_name, department, student_level, matric_number, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING student_id",
      [firstName, lastName, department, level, matric_number, hashedPassword]
    );

    if (result.rows.length > 0) {
      req.session.userId = result.rows[0].student_id;
      req.session.userLevel = level;
      res
        .status(201)
        .json({
          userId: result.rows[0].student_id,
          session: req.session.userId,
        });
    } else {
      // No rows inserted, handle accordingly
      res.status(500).send("Failed to create user, no ID returned.");
    }
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "23505") {
      // unique violation for matric_number
      res.status(409).send("Matric number is already in use.");
    } else {
      res.status(500).send("Error creating user");
    }
  }
});

// login route
router.post("/login", async (req, res) => {
  const { matric_number, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM students WHERE matric_number = $1",
      [matric_number]
    );
    if (result.rows.length === 0) return res.status(404).send("User not found");

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Set up user session
      req.session.userId = user.student_id;
      console.log("SESSION ID SET: ", req.session.userId);
      req.session.userLevel = user.student_level;
      res.status(200).json({ level: user.student_level, lastName: user.last_name });
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to logout");
    }
    res.send("Logged out");
  });
});

module.exports = router;
