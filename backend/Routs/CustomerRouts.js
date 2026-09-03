const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const verifyToken = require("../Authmiddleware · JS");
const { addCustomer } = require("../Controllers/CustomerControllers/AddCustomer.jsx");
const { getCustomers } = require("../Controllers/CustomerControllers/GetCustomers");
const { getCustomerById } = require("../Controllers/CustomerControllers/GetCustomerById");
const { updateCustomer } = require("../Controllers/CustomerControllers/UpdateCustomer");
const { deleteCustomer } = require("../Controllers/CustomerControllers/DeleteCustomer");

const uploadDir = path.join(__dirname, "../uploads/customers");

// create the folder (and any missing parent folders) if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("image"), addCustomer);
router.get("/", verifyToken, getCustomers);
router.get("/:id", verifyToken, getCustomerById);
router.put("/:id", verifyToken, upload.single("image"), updateCustomer);
router.delete("/:id", verifyToken, deleteCustomer);

module.exports = router;