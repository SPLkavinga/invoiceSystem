const express = require("express");
const router = express.Router();
const { signup } = require("../Controllers/AuthControllers/Signup");
const { login } = require("../Controllers/AuthControllers/Login");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;