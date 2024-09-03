const express = require("express");
const pool = require("./db");
require("dotenv").config();

const router = express.Router();

router.post("/questions", async (req, res) => {
  const { Title, Description, level, question, duration } = req.body;
  const creatorId = req.session.userId;
  console.log("Using creatorId:", creatorId);

  try {
    const result = await pool.query(
      "INSERT INTO exams (title, description, exam_level, question, duration, creator_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING exam_id, creator_id",
      [Title, Description, level, question, duration, creatorId]
    );
    res.status(201).json({
      examId: result.rows[0].exam_id,
      creatorId: result.rows[0].creator_id,
      message:
        "Exam created successfully, access granted to user " +
        req.session.userId,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res
        .status(409)
        .send(
          "An exam with this title already exists. Please choose a different title."
        );
    } else {
      return res.status(500).send("Error creating exam");
    }
  }
});

// fetch exams data for examiners
router.get("/exams-data", async (req, res) => {
  const creatorId = req.session.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM exams WHERE creator_id = $1",
      [creatorId]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).send("No exams found for this user.");
    }
  } catch (error) {
    console.error("Failed to retrieve exams: ", error);
    res.status(500).send("Error retrieving exams");
  }
});

// fetch exam data for student
router.get("/student-exam-data", async (req, res) => {
  const student_level = req.session.userLevel;

  try {
    const result = await pool.query(
      "SELECT * FROM exams WHERE exam_level = $1",
      [student_level]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).send("No exams found for this user.");
    }
  } catch (error) {
    console.error("Failed to retrieve exams: ", error);
    res.status(500).send("Error retrieving exams");
  }
});

// Fetch a specific exam by ID
router.get("/:exam_id", async (req, res) => {
  const { exam_id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM exams WHERE exam_id = $1", [exam_id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Exam not found.");
    }
  } catch (error) {
    console.error("Failed to retrieve the exam: ", error);
    res.status(500).send("Error retrieving the exam");
  }
});


//endpoint for exam updates
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, exam_level, question, duration } = req.body;
  const updates = { title, description, exam_level, question, duration };
  const fields = Object.keys(updates).filter(
    (key) => updates[key] !== undefined
  );

  if (fields.length === 0) {
    return res.status(400).send("No updates provided.");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  const values = fields.map((field) => updates[field]);

  try {
    const result = await pool.query(
      `UPDATE exams SET ${setClause} WHERE exam_id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );

    if (result.rows.length > 0) {
      res.json({
        message: "Exam updated successfully",
        exam: result.rows[0],
      });
    } else {
      res.status(404).send("Exam not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update exam");
  }
});

// Delete an exam
router.delete("/:exam_id", async (req, res) => {
  const { exam_id } = req.params;
  const creatorId = req.session.userId;

  try {
    const verifyExam = await pool.query(
      "SELECT * FROM exams WHERE exam_id = $1 AND creator_id = $2",
      [exam_id, creatorId]
    );

    if (verifyExam.rows.length === 0) {
      return res
        .status(404)
        .send(
          "Exam not found or you don't have the permission to delete this exam."
        );
    }

    // eslint-disable-next-line no-unused-vars
    const result = await pool.query("DELETE FROM exams WHERE exam_id = $1", [
      exam_id,
    ]);

    res.status(200).send("Exam deleted successfully.");
  } catch (error) {
    console.error("Failed to delete the exam: ", error);
    res.status(500).send("Error deleting the exam");
  }
});

module.exports = router;
