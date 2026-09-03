const pool = require("../../db/db");

exports.getCustomerById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, customer_name, nic, tp_number, company_name, address, email, fax,
              customer_type, notes, image, created_at
       FROM customers
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ customer: rows[0] });
  } catch (err) {
    console.error("Get customer error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};