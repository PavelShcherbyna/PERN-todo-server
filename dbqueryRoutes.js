const express = require('express');
const pool = require("./db");

const router = express.Router();

router.route('/ct').get(async (req, res) => {
  try {

    await pool.query("CREATE TABLE users(user_id SERIAL PRIMARY KEY, name VARCHAR(80) NOT NULL, email VARCHAR(80) NOT NULL UNIQUE, password VARCHAR(80) NOT NULL CHECK (char_length(password) > 8))");

    res.json("Query was complete!");
  } catch (err) {
    console.error(err.message);
  }
})


module.exports = router;