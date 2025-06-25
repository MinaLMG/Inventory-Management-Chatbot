const express = require("express");
const router = express.Router();
const controller = require("../controllers/InventoryController");

const authenticate = require("../middleware/authMiddleware");
router.use(authenticate); // All below routes are protected

router.get("/", controller.getInventory);
router.get("/name/:name", controller.getOneInventoryByName);
router.get("/id/:id", controller.getOneInventoryByID);
router.post("/", controller.createItem);
router.put("/id/:id", controller.updateItemByName);
router.put("/name/:name", controller.updateItemByName);
router.delete("/id/:id", controller.deleteItemByID);
router.delete("/name/:name", controller.deleteItemByName);

module.exports = router;
