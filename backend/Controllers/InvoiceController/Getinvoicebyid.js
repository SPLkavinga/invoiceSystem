const pool = require("../../db/db");

exports.getInvoiceById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [invoiceRows] = await pool.query(
      `SELECT i.*, c.customer_name, c.email AS customer_email, c.tp_number AS customer_phone,
              c.address AS customer_address, c.company_name AS customer_company
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       WHERE i.id = ? AND i.user_id = ?`,
      [id, userId]
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const [items] = await pool.query(
      `SELECT id, product_name, quantity, unit_price, amount
       FROM invoice_items
       WHERE invoice_id = ?`,
      [id]
    );

    return res.status(200).json({ invoice: invoiceRows[0], items });
  } catch (err) {
    console.error("Get invoice error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};