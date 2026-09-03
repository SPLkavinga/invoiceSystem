const pool = require("../../db/db");

exports.getCustomers = async (req, res) => {
  const userId = req.user.id; // from verifyToken middleware — only this user's customers

  try {
    const [rows] = await pool.query(
      `SELECT id, customer_name, nic, tp_number, company_name, address, email, fax,
              customer_type, notes, image, created_at
       FROM customers
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({ customers: rows });
  } catch (err) {
    console.error("Get customers error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};