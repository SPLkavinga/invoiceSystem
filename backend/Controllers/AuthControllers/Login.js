const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db/db");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing — check that .env is in the backend root and dotenv loads before this file runs.");
    return res.status(500).json({ message: "Server misconfigured, contact admin" });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, username, id_number, email, password FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // payload carried inside the token: user id, name, NIC/ID number
    const payload = {
      id: user.id,
      username: user.username,
      idNumber: user.id_number,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};