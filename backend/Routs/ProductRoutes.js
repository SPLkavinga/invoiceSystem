const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const verifyToken = require("../Authmiddleware · JS");
const { addProduct } = require("../Controllers/ProductControllers/Addproduct");
const { getProducts } = require("../Controllers/ProductControllers/GetProducts");
const { getProductById } = require("../Controllers/ProductControllers/GetProductById");
const { deleteProduct } = require("../Controllers/ProductControllers/DeleteProduct");
const { updateProduct } = require("../Controllers/ProductControllers/Updateproduct ");

const uploadDir = path.join(__dirname, "../uploads/products");

// create the folder (and any missing parent folders) if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("image"), addProduct);
router.get("/", verifyToken, getProducts);
router.get("/:id", verifyToken, getProductById);
router.put("/:id", verifyToken, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

module.exports = router;