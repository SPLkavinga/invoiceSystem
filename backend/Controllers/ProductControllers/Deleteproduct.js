const pool = require("../../db/db");

exports.deleteProduct = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // only delete if this product actually belongs to the logged-in user
    const [result] = await pool.query(
      "DELETE FROM products WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};