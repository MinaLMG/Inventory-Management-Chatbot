const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventoryController");

router.get("/", controller.getInventory);
router.get("/:id", controller.getOneInventory);
router.post("/", controller.createItem);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;
