const express = require("express");
const router = express.Router();
const messageController = require("../controllers/MessageController");
const authenticate = require("../middleware/authMiddleware");

router.use(authenticate); // All below routes are protected

router.get("/", messageController.getMessages);
router.post("/", messageController.addMessage);

module.exports = router;
