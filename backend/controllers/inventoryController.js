const Inventory = require("../models/InventoryModel");

// GET /inventory
exports.getInventory = async (req, res) => {
    const userId = req.user.id;

    try {
        const items = await Inventory.find({ user: userId });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /inventory/name/:name
exports.getOneInventoryByName = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.params;

    try {
        const item = await Inventory.findOne({ name: name, user: userId });
        if (!item) return res.status(404).json({ error: "Item not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// GET /inventory/id/:id
exports.getOneInventoryByID = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const item = await Inventory.findOne({ _id: id, user: userId });
        if (!item) return res.status(404).json({ error: "Item not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /inventory
exports.createItem = async (req, res) => {
    const userId = req.user.id;
    const { name, price, quantity } = req.body;

    if (!name || price == null || quantity == null) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newItem = new Inventory({ user: userId, name, price, quantity });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Item name must be unique" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// PUT /inventory/id/:id
exports.updateItemByID = async (req, res) => {
    const userId = req.user.id;
    const { name, price, quantity } = req.body;
    const { id } = req.params;

    if (name == null && price == null && quantity == null) {
        return res
            .status(400)
            .json({ error: "At least one field is required" });
    }

    const updateFields = {};
    if (name != null) updateFields.name = name;
    if (price != null) updateFields.price = price;
    if (quantity != null) updateFields.quantity = quantity;

    try {
        const updated = await Inventory.findOneAndUpdate(
            { _id: id, user: userId },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ error: "Item not found" });

        res.json(updated);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Item name must be unique" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};
// PUT /inventory/name/:name
exports.updateItemByName = async (req, res) => {
    const userId = req.user.id;
    console.log("asdsad", req.body);
    const { name, price, quantity } = req.body;
    const oldName = req.params.name;

    if (name == null && price == null && quantity == null) {
        return res
            .status(400)
            .json({ error: "At least one field is required" });
    }

    const updateFields = {};
    if (name != null) updateFields.name = name;
    if (price != null) updateFields.price = price;
    if (quantity != null) updateFields.quantity = quantity;

    try {
        const updated = await Inventory.findOneAndUpdate(
            { name: oldName, user: userId },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ error: "Item not found" });

        res.json(updated);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Item name must be unique" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// DELETE /inventory/id/:id
exports.deleteItemByID = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const deleted = await Inventory.findOneAndDelete({
            _id: id,
            user: userId,
        });
        if (!deleted) return res.status(404).json({ error: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /inventory/name/:name
exports.deleteItemByName = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.params;

    try {
        const deleted = await Inventory.findOneAndDelete({
            name: name,
            user: userId,
        });
        if (!deleted) return res.status(404).json({ error: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
