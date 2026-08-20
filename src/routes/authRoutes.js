const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("有効なemailを入力してください"),
    body("password").isLength({ min: 6 }).withMessage("passwordは6文字以上で入力してください"),
  ],
  register
);

router.post("/login", login);

module.exports = router;