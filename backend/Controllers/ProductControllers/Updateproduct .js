const pool = require("../../db/db");

exports.updateProduct = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    productName,
    productCode,
    category,
    price,
    costPrice,
    quantity,
    unit,
    expireDate,
    rackNo,
    zoneNumber,
    supplier,
    description,
  } = req.body;

  if (!productName || !productCode || !price) {
    return res.status(400).json({ message: "Product name, product number, and price are required" });
  }

  try {
    // confirm this product belongs to the logged-in user, and get the current image filename
    const [existingRows] = await pool.query(
      "SELECT image FROM products WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // keep the old image unless a new one was uploaded in this request
    const image = req.file ? req.file.filename : existingRows[0].image;

    await pool.query(
      `UPDATE products SET
        product_name = ?, product_code = ?, category = ?, price = ?, cost_price = ?,
        quantity = ?, unit = ?, expire_date = ?, rack_no = ?, zone_number = ?,
        supplier = ?, description = ?, image = ?
       WHERE id = ? AND user_id = ?`,
      [
        productName,
        productCode,
        category || null,
        price,
        costPrice || null,
        quantity || 0,
        unit || "pcs",
        expireDate || null,
        rackNo || null,
        zoneNumber || null,
        supplier || null,
        description || null,
        image,
        id,
        userId,
      ]
    );

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};