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
      // same product, same price — top up the existing stock instead of duplicating.
      // this does NOT count against the product limit, since no new product is created.
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

    // about to create a genuinely NEW product row — enforce the plan's product limit first.
    //
    // Resolved as explicit, separate queries (not a single JOIN with a hardcoded
    // fallback id) so that if the user's package doesn't match any real plan,
    // we find that out and fail CLOSED (block the request) instead of silently
    // skipping the limit check.
    const [userRows] = await pool.query("SELECT package FROM users WHERE id = ?", [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User account not found" });
    }

    let planId = userRows[0].package;

    // no package assigned yet — fall back to whichever plan is actually
    // marked as Free by its slug, rather than assuming id = 1
    if (!planId) {
      const [freePlanRows] = await pool.query(
        "SELECT id FROM plans WHERE slug = 'free' AND is_active = 1 LIMIT 1"
      );
      if (freePlanRows.length === 0) {
        console.error(`No package set for user ${userId} and no 'free' plan exists to fall back to.`);
        return res.status(500).json({ message: "Unable to verify your plan. Please contact support." });
      }
      planId = freePlanRows[0].id;
    }

    const [planRows] = await pool.query(
      "SELECT id, name, product_limit FROM plans WHERE id = ? AND is_active = 1",
      [planId]
    );

    if (planRows.length === 0) {
      // the user's package points at a plan that no longer exists/is inactive —
      // block rather than silently allow unlimited products
      console.error(`User ${userId} has package=${planId}, which doesn't match any active plan.`);
      return res.status(500).json({ message: "Unable to verify your plan. Please contact support." });
    }

    const { name: planName, product_limit: productLimit } = planRows[0];

    // product_limit === null means unlimited for this plan — only check when it's a real number
    if (productLimit !== null) {
      const [countRows] = await pool.query(
        "SELECT COUNT(*) AS total FROM products WHERE user_id = ?",
        [userId]
      );
      const currentCount = countRows[0].total;

      if (currentCount >= productLimit) {
        return res.status(403).json({
          code: "PRODUCT_LIMIT_REACHED",
          message: `Your ${planName} plan allows up to ${productLimit} products. Upgrade your plan to add more.`,
          limit: productLimit,
          current: currentCount,
        });
      }
    }

    // under the limit (or unlimited) — proceed as normal
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