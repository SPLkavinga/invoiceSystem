const pool = require("../../db/db");

exports.getProductById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, product_name, product_code, category, price, cost_price, quantity,
              unit, expire_date, rack_no, zone_number, supplier, description, image, created_at
       FROM products
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product: rows[0] });
  } catch (err) {
    console.error("Get product error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};