const pool = require("../../db/db");

exports.addInvoice = async (req, res) => {
  const userId = req.user.id; // from verifyToken middleware — the logged-in user
  const {
    customerId,
    invoiceNumber,
    invoiceDate,
    dueDate,
    discount,
    taxPercent,
    paidAmount,
    notes,
    items, // array of { productId, productName, quantity, unitPrice }
  } = req.body;

  if (!customerId || !invoiceNumber || !invoiceDate || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Customer, invoice number, invoice date, and at least one product line are required",
    });
  }

  // server-side totals calculation — never trust totals sent from the client
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
  const discountAmount = Number(discount) || 0;
  const taxPct = Number(taxPercent) || 0;
  const taxAmount = (subtotal * taxPct) / 100;
  const totalAmount = subtotal - discountAmount + taxAmount;
  const paid = Number(paidAmount) || 0;
  const balance = totalAmount - paid;

  let status = "Unpaid";
  if (balance <= 0) status = "Paid";
  else if (paid > 0) status = "Partial";

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // STEP 1 — lock and validate stock for every line item BEFORE writing anything.
    // FOR UPDATE locks these product rows until commit/rollback, preventing two
    // simultaneous invoices from both "succeeding" against the same limited stock.
    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT id, product_name, quantity FROM products WHERE id = ? AND user_id = ? FOR UPDATE",
        [item.productId, userId]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Product not found: ${item.productName || item.productId}` });
      }

      const product = rows[0];
      const requestedQty = Number(item.quantity);

      if (requestedQty > product.quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Not enough stock for "${product.product_name}". Available: ${product.quantity}, requested: ${requestedQty}`,
        });
      }
    }

    // STEP 2 — all items passed validation, safe to create the invoice
    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices
        (user_id, customer_id, invoice_number, invoice_date, due_date, subtotal,
         discount, tax_percent, tax_amount, total_amount, paid_amount, balance_amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        customerId,
        invoiceNumber,
        invoiceDate,
        dueDate || null,
        subtotal,
        discountAmount,
        taxPct,
        taxAmount,
        totalAmount,
        paid,
        balance,
        status,
        notes || null,
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // STEP 3 — insert each line item and deduct the sold quantity from stock
    for (const item of items) {
      const amount = Number(item.quantity) * Number(item.unitPrice);

      await connection.query(
        `INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.productId, item.productName, item.quantity, item.unitPrice, amount]
      );

      await connection.query(
        "UPDATE products SET quantity = quantity - ? WHERE id = ? AND user_id = ?",
        [item.quantity, item.productId, userId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Invoice created successfully",
      invoiceId,
      totalAmount,
      balance,
      status,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Add invoice error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This invoice number already exists" });
    }
    return res.status(500).json({ message: "Server error, please try again" });
  } finally {
    connection.release();
  }
};