const express = require("express");
const isAuthenticated = require("./middleware");
const router = express.Router();

router.get("/secure-route", isAuthenticated, (req, res) => {
  res.send("This is secure content");
});

module.exports = router;
