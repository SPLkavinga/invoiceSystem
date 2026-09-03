const pool = require("../../db/db");

exports.updateCustomer = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    customerName,
    nic,
    tpNumber,
    companyName,
    address,
    email,
    fax,
    customerType,
    notes,
  } = req.body;

  if (!customerName || !nic || !tpNumber) {
    return res.status(400).json({ message: "Customer name, NIC, and telephone number are required" });
  }

  try {
    // confirm this customer belongs to the logged-in user, and get the current image filename
    const [existingRows] = await pool.query(
      "SELECT image FROM customers WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // keep the old image unless a new one was uploaded in this request
    const image = req.file ? req.file.filename : existingRows[0].image;

    await pool.query(
      `UPDATE customers SET
        customer_name = ?, nic = ?, tp_number = ?, company_name = ?, address = ?,
        email = ?, fax = ?, customer_type = ?, notes = ?, image = ?
       WHERE id = ? AND user_id = ?`,
      [
        customerName,
        nic,
        tpNumber,
        companyName || null,
        address || null,
        email || null,
        fax || null,
        customerType || "Individual",
        notes || null,
        image,
        id,
        userId,
      ]
    );

    return res.status(200).json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error("Update customer error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};