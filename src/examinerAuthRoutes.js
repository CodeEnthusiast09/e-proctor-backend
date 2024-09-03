const express = require("express");
const pool = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const router = express.Router();

// sign up route
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO Examiners (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
      [firstName, lastName, email, hashedPassword]
    );
    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "23505") {
      // unique violation for email
      res.status(409).send("Email is already in use.");
    } else {
      res.status(500).send("Error creating user");
    }
  }
});

// login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM Examiners WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) return res.status(404).send("User not found");

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      req.session.userId = user.id;
      console.log("SESSION ID SET: ", req.session.userId);
      res.status(200).json({ id: user.id, lastName: user.last_name });
    } else {
      return res.status(401).send("Invalid Details");
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
