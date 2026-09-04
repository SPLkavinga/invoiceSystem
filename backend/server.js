const dotenv = require('dotenv');
dotenv.config();   // must run first, before anything that needs process.env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require("./Routs/AuthRouts");
const customerRoutes = require("./Routs/CustomerRouts");
const productRoutes = require("./Routs/ProductRoutes");
const invoiceRoutes = require("./Routs/InvoiceRouts");
const reportRoutes = require("./Routs/ReportRouts");

require("./db/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

// serve uploaded customer photos, e.g. http://localhost:5000/uploads/customers/169...-photo.jpg
app.use("/uploads", express.static("uploads"));

// Health Check
app.get("/", (req, res) => {
  res.send("AsipBook Account Center API is running.");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});