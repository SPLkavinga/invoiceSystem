const pool = require("../../db/db");

exports.deleteInvoice = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // ON DELETE CASCADE on invoice_items.invoice_id removes the line items automatically
    const [result] = await pool.query(
      "DELETE FROM invoices WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Delete invoice error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};