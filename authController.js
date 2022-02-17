const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const correctPassword = async function (candidatePassword, dataBasePassword) {
  return await bcrypt.compare(candidatePassword, dataBasePassword);
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    if (password.length < 2) {
      res.status(400).json({
        message: "Please, provide a password!",
      });
    }
    if (password !== passwordConfirm) {
      res.status(400).json({
        message: "Passwords mismatch!",
      });
    }

    const encPassword = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING *",
      [name, email, encPassword]
    );

    const token = signToken(newUser.rows[0].user_id);

    newUser.rows[0].password = undefined;

    res.status(201).json({
      status: "success",
      token,
      user: newUser.rows[0],
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Please enter your email address and password!",
      });
    }
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    console.log("User from DB:", user.rows[0]);

    if (
      !user.rows[0] ||
      !(await correctPassword(password, user.rows[0].password))
    ) {
      res.status(400).json({
        message: "Incorrect email address or password!",
      });
    }

    const token = signToken(user.rows[0].user_id);

    user.rows[0].password = undefined;

    res.status(200).json({
      status: "success",
      token,
      user: user.rows[0],
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token === "null") {
      res.status(400).json({
        message: "You are not authorized! Log in to get access!",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [decoded.id]
    );

    if (!currentUser.rows[0]) {
      res.status(400).json({
        message: "User no longer exists.",
      });
    }

    req.user = currentUser.rows[0];
    next();
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
};
