const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post(
  "/",
  [body("title").notEmpty().withMessage("titleは必須です")],
  createTask
);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;