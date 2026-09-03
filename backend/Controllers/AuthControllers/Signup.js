const bcrypt = require("bcryptjs");
const pool = require("../../db/db");

exports.signup = async (req, res) => {
  const { username, idNumber, email, password } = req.body;

  // basic validation
  if (!username || !idNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // check each field separately so we can return a specific message
    const [existing] = await pool.query(
      "SELECT username, id_number, email FROM users WHERE username = ? OR id_number = ? OR email = ?",
      [username, idNumber, email]
    );

    if (existing.length > 0) {
      const row = existing[0];
      let message = "Account already exists";
      if (row.email === email) message = "This email is already registered";
      else if (row.id_number === idNumber) message = "This ID number is already registered";
      else if (row.username === username) message = "This username is already taken";

      return res.status(409).json({ message });
    }

    // hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, id_number, email, password) VALUES (?, ?, ?, ?)",
      [username, idNumber, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Account created successfully",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};