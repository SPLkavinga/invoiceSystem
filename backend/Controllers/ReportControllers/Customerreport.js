const pool = require("../../db/db");

exports.getCustomerReport = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT
         c.id, c.customer_name, c.nic, c.tp_number, c.email, c.company_name,
         c.customer_type, c.created_at,
         COUNT(i.id) AS invoice_count,
         COALESCE(SUM(i.total_amount), 0) AS total_invoiced,
         COALESCE(SUM(i.paid_amount), 0) AS total_paid,
         COALESCE(SUM(i.balance_amount), 0) AS total_balance
       FROM customers c
       LEFT JOIN invoices i ON i.customer_id = c.id AND i.user_id = c.user_id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY total_invoiced DESC`,
      [userId]
    );

    return res.status(200).json({ customers: rows });
  } catch (err) {
    console.error("Customer report error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};