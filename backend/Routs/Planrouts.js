const express = require("express");
const router = express.Router();

const verifyToken = require("../Authmiddleware · JS");
const { getPlans } = require("../Controllers/PlanControllers/GetPlans");
const { getCurrentPlan } = require("../Controllers/PlanControllers/GetCurrentPlan");
const { selectPlan } = require("../Controllers/PlanControllers/SelectPlan");

router.get("/", getPlans); // public — pricing page can be viewed without logging in
router.get("/current", verifyToken, getCurrentPlan); // which plan the logged-in user is on
router.put("/select", verifyToken, selectPlan); // must be logged in to choose a plan

module.exports = router;