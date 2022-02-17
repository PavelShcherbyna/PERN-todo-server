const express = require("express");
const cors = require("cors");
const pool = require("./db");
const morgan = require("morgan");
const path = require("path");
const dbqueryRoutes = require("./dbqueryRoutes");
const authController = require("./authController");
const dotenv = require("dotenv");

// CONFIG
dotenv.config({ path: "./config.env" });

const app = express();

//middleware//
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));
//ROUTES//

// signUp, signIn, getMe

app.post("/signup", authController.signup);
app.post("/login", authController.login);
app.get("/getMe", authController.protect, authController.getMe);

//create a todo

app.post("/todos", authController.protect, async (req, res) => {
  try {
    const { description } = req.body;
    if (description === " ") {
      return res.json("Incorrect todo description");
    }
    // const newTodo = await pool.query(
    //   "INSERT INTO todo (description) VALUES($1) RETURNING *",
    //   [description]
    // );
    const newTodo = await pool.query(
      "INSERT INTO todo (description, user_id) VALUES($1, $2) RETURNING *",
      [description, req.user.user_id]
    );

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({
      message: err.message,
    });
  }
});

//get all todos

app.get("/todos", authController.protect, async (req, res) => {
  try {
    const allTodos = await pool.query(
      "SELECT * FROM todo WHERE user_id = $1 order by description",
      [req.user.user_id]
    );

    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      id,
    ]);

    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    await pool.query("UPDATE todo SET description = $1 WHERE todo_id = $2", [
      description,
      id,
    ]);

    res.json("Todo was updated!");
  } catch (err) {
    console.error(err.message);
  }
});

//delete todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);

    res.json("Todo was deleted!");
  } catch (err) {
    console.error(err.message);
  }
});

app.use("/dbquery", dbqueryRoutes);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});
