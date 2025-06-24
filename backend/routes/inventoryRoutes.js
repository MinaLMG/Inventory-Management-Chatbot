const express = require("express");
const router = express.Router();
const controller = require("../controllers/InventoryController");

const authenticate = require("../middleware/authMiddleware");
router.use(authenticate); // All below routes are protected

router.get("/", controller.getInventory);
router.get("/:id", controller.getOneInventory);
router.post("/", controller.createItem);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;
