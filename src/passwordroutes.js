const express = require("express");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailgun = require("mailgun-js");
require("dotenv").config();

const router = express.Router();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// forgot password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM Examiners WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) return res.status(404).send("User not found");

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `https://e-proctor.vercel.app/resetPassword?token=${token}`;

    let data = {
      from: "<mailgun@your-domain.com>",
      to: user.email,
      subject: "Password Reset",
      text: `Click on the following link to reset your password: ${resetLink}`,
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Error sending email");
      }
      console.log("Email sent:", body);
      res.status(200).send("Password reset email sent");
    });
  } catch (err) {
    console.error("Error processing forgot password request:", err);
    res.status(500).send("Error processing request");
  }
});

// reset password route
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE Examiners SET password = $1 WHERE id = $2", [
      hashedPassword,
      decoded.userId,
    ]);
    res.status(200).send("Password reset successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error resetting password");
  }
});

module.exports = router;
