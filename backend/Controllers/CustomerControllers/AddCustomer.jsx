const pool = require("../../db/db");

exports.addCustomer = async (req, res) => {
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

  const userId = req.user.id; // comes from the verifyToken middleware — the logged-in user
  const image = req.file ? req.file.filename : null;

  if (!customerName || !nic || !tpNumber) {
    return res.status(400).json({ message: "Customer name, NIC, and telephone number are required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO customers
        (user_id, customer_name, nic, tp_number, company_name, address, email, fax, customer_type, notes, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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
      ]
    );

    return res.status(201).json({
      message: "Customer added successfully",
      customerId: result.insertId,
    });
  } catch (err) {
    console.error("Add customer error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};