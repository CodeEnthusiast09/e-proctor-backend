const express = require("express");
const pool = require("./db");

const router = express.Router();

router.post("/enrollments", async (req, res) => {
  const { exam_ids } = req.body;
  const student_id = req.session.userId;

  try {
    const client = await pool.connect();
    await client.query("BEGIN");
    const insertPromises = exam_ids.map((exam_id) =>
      client.query(
        "INSERT INTO enrollments (exam_id, student_id) VALUES ($1, $2) RETURNING student_id",
        [exam_id, student_id]
      )
    );
    await Promise.all(insertPromises);
    await client.query("COMMIT");
    client.release();
    res.status(201).json({ message: "Enrolled successfully for exams" });
  } catch (error) {
    console.error(error);
    client.query("ROLLBACK");
    client.release();
    if (error.code === "23505") {
      return res.status(409).send("Exam has already been enrolled for");
    } else {
      return res.status(500).send("Error enrolling for exams");
    }
  }
});

router.get("/enrollments-questions", async (req, res) => {
  const student_id = req.session.userId;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT e.exam_id, ex.title, ex.description, ex.duration
       FROM enrollments e
       JOIN exams ex ON e.exam_id = ex.exam_id
       WHERE e.student_id = $1`,
      [student_id]
    );
    client.release();

    // Check if we got any results
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).send("No exams found");
    }
  } catch (error) {
    console.error(error);
    client.release();
    res.status(500).send("Error retrieving exam details");
  }
});

module.exports = router;
