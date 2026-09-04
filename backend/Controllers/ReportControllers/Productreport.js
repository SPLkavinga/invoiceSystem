const pool = require("../../db/db");

exports.getProductReport = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT
         p.id, p.product_name, p.product_code, p.category, p.price, p.cost_price,
         p.quantity, p.unit, p.expire_date, p.rack_no, p.zone_number, p.supplier,
         COALESCE(SUM(ii.quantity), 0) AS total_sold,
         COALESCE(SUM(ii.amount), 0) AS total_revenue
       FROM products p
       LEFT JOIN invoice_items ii ON ii.product_id = p.id
       LEFT JOIN invoices i ON i.id = ii.invoice_id AND i.user_id = p.user_id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY total_sold DESC`,
      [userId]
    );

    return res.status(200).json({ products: rows });
  } catch (err) {
    console.error("Product report error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};