const pool = require("../../db/db");

exports.selectPlan = async (req, res) => {
  const userId = req.user.id;
  const { planId } = req.body;

  if (!planId) {
    return res.status(400).json({ message: "planId is required" });
  }

  try {
    // confirm this is a real, active plan before assigning it
    const [planRows] = await pool.query(
      "SELECT id, name, price FROM plans WHERE id = ? AND is_active = 1",
      [planId]
    );

    if (planRows.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }
    const newPlan = planRows[0];

    // look up the user's current package number
    const [userRows] = await pool.query(
      `SELECT p.id, p.name, p.price FROM users u
       LEFT JOIN plans p ON p.id = u.package
       WHERE u.id = ?`,
      [userId]
    );
    const previousPlan = userRows[0]?.id ? userRows[0] : null;

    // RULE: once the user's package number is greater than 1 (i.e. they are on
    // a paid plan), they are no longer allowed to switch back to package 1 (Free).
    // Moving between paid plans (e.g. Pro <-> Ultra) is still always allowed.
    if (previousPlan && previousPlan.id > 1 && Number(newPlan.id) === 1) {
      return res.status(403).json({
        message: "Cannot select this free package — you've already upgraded to a paid plan.",
      });
    }

    // always overwrite otherwise — no other restriction
    await pool.query("UPDATE users SET package = ? WHERE id = ?", [planId, userId]);

    return res.status(200).json({
      message: `You are now on the ${newPlan.name} plan`,
      package: newPlan.id,
      previousPackage: previousPlan ? previousPlan.id : null,
      previousPlanName: previousPlan ? previousPlan.name : null,
    });
  } catch (err) {
    console.error("Select plan error:", err);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};