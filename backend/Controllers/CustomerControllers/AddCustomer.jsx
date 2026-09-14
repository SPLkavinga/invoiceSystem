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
    // STEP 1 — resolve the user's actual plan row. Done as two explicit
    // queries (not a single JOIN with a hardcoded fallback id) so that if
    // the user's package doesn't match any real plan, we find that out
    // and fail CLOSED (block the request) instead of silently skipping
    // the limit check — which is what let this slip through before.
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
      "SELECT id, name, customer_limit FROM plans WHERE id = ? AND is_active = 1",
      [planId]
    );

    if (planRows.length === 0) {
      // the user's package points at a plan that no longer exists/is inactive —
      // block rather than silently allow unlimited customers
      console.error(`User ${userId} has package=${planId}, which doesn't match any active plan.`);
      return res.status(500).json({ message: "Unable to verify your plan. Please contact support." });
    }

    const { name: planName, customer_limit: customerLimit } = planRows[0];

    // STEP 2 — enforce the limit (customer_limit === null means unlimited)
    if (customerLimit !== null) {
      const [countRows] = await pool.query(
        "SELECT COUNT(*) AS total FROM customers WHERE user_id = ?",
        [userId]
      );
      const currentCount = countRows[0].total;

      if (currentCount >= customerLimit) {
        return res.status(403).json({
          code: "CUSTOMER_LIMIT_REACHED",
          message: `Your ${planName} plan allows up to ${customerLimit} customers. Upgrade your plan to add more.`,
          limit: customerLimit,
          current: currentCount,
        });
      }
    }

    // STEP 3 — under the limit (or unlimited) — proceed as normal
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