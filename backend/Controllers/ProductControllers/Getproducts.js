const pool = require("../../db/db");

exports.getProducts = async (req, res) => {
  const userId = req.user.id; // from verifyToken middleware — only this user's products

  try {
    const [rows] = await pool.query(
      `SELECT id, product_name, product_code, category, price, cost_price, quantity,
              unit, expire_date, rack_no, zone_number, supplier, description, image, created_at
       FROM products
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({ products: rows });
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};