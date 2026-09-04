const pool = require("../../db/db");

exports.getSalesReport = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  try {
    let query = `
      SELECT i.id, i.invoice_number, i.invoice_date, i.due_date, i.subtotal, i.discount,
             i.tax_amount, i.total_amount, i.paid_amount, i.balance_amount, i.status,
             c.customer_name
      FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      WHERE i.user_id = ?
    `;
    const params = [userId];

    if (startDate) {
      query += " AND i.invoice_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND i.invoice_date <= ?";
      params.push(endDate);
    }

    query += " ORDER BY i.invoice_date DESC";

    const [rows] = await pool.query(query, params);

    return res.status(200).json({ invoices: rows });
  } catch (err) {
    console.error("Sales report error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};