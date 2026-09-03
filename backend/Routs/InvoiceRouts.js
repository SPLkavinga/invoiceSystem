const express = require("express");
const router = express.Router();

const verifyToken = require("../Authmiddleware · JS");
const { addInvoice } = require("../Controllers/InvoiceController/AddInvoice");
const { getInvoices } = require("../Controllers/InvoiceController/Getinvoices");
const { getInvoiceById } = require("../Controllers/InvoiceController/Getinvoicebyid");
const { deleteInvoice } = require("../Controllers/InvoiceController/Deleteinvoice");

router.post("/", verifyToken, addInvoice);
router.get("/", verifyToken, getInvoices);
router.get("/:id", verifyToken, getInvoiceById);
router.delete("/:id", verifyToken, deleteInvoice);

module.exports = router;