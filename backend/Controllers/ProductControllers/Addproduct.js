const pool = require("../../db/db");

exports.addProduct = async (req, res) => {
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

  const userId = req.user.id; // from verifyToken middleware — the logged-in user
  const image = req.file ? req.file.filename : null;
  const newQuantity = Number(quantity) || 0;

  if (!productName || !productCode || !price) {
    return res.status(400).json({ message: "Product name, product number, and price are required" });
  }

  try {
    // look for existing products with the same name for this user (case-insensitive)
    const [existingRows] = await pool.query(
      `SELECT id, price, quantity FROM products
       WHERE user_id = ? AND LOWER(product_name) = LOWER(?)`,
      [userId, productName]
    );

    // among those, find one whose price matches (within a cent, to avoid float rounding issues)
    const matchingPriceRow = existingRows.find(
      (row) => Math.abs(Number(row.price) - Number(price)) < 0.01
    );

    if (matchingPriceRow) {
      // same product, same price — top up the existing stock instead of duplicating
      await pool.query(
        `UPDATE products SET quantity = quantity + ? WHERE id = ? AND user_id = ?`,
        [newQuantity, matchingPriceRow.id, userId]
      );

      return res.status(200).json({
        message: `Existing product found — added ${newQuantity} to its stock instead of creating a duplicate.`,
        productId: matchingPriceRow.id,
        updatedQuantity: matchingPriceRow.quantity + newQuantity,
        merged: true,
      });
    }

    // either no product with this name exists, or it exists at a different price — insert as new
    const [result] = await pool.query(
      `INSERT INTO products
        (user_id, product_name, product_code, category, price, cost_price, quantity,
         unit, expire_date, rack_no, zone_number, supplier, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        productName,
        productCode,
        category || null,
        price,
        costPrice || null,
        newQuantity,
        unit || "pcs",
        expireDate || null,
        rackNo || null,
        zoneNumber || null,
        supplier || null,
        description || null,
        image,
      ]
    );

    return res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
      merged: false,
    });
  } catch (err) {
    console.error("Add product error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};