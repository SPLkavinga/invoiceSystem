const pool = require("../../db/db");

exports.getPlans = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC`
    );
    return res.status(200).json({ plans: rows });
  } catch (err) {
    console.error("Get plans error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};