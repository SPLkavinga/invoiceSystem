const pool = require("../../db/db");

exports.getInvoices = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.invoice_number, i.invoice_date, i.due_date, i.total_amount,
              i.paid_amount, i.balance_amount, i.status, c.customer_name
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ invoices: rows });
  } catch (err) {
    console.error("Get invoices error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};