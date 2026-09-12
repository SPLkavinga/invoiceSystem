const pool = require("../../db/db");

exports.getCurrentPlan = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price
       FROM users u
       LEFT JOIN plans p ON p.id = u.package
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0 || !rows[0].id) {
      return res.status(200).json({ plan: null });
    }

    return res.status(200).json({ plan: rows[0] });
  } catch (err) {
    console.error("Get current plan error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};