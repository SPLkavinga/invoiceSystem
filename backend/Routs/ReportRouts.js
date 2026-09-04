const express = require("express");
const router = express.Router();

const verifyToken = require("../Authmiddleware · JS");
const { getCustomerReport } = require("../Controllers/ReportControllers/Customerreport");
const { getSalesReport } = require("../Controllers/ReportControllers/Salesreport");
const { getProductReport } = require("../Controllers/ReportControllers/Productreport");

router.get("/customers", verifyToken, getCustomerReport);
router.get("/sales", verifyToken, getSalesReport);
router.get("/products", verifyToken, getProductReport);

module.exports = router;