const Inventory = require("../models/inventoryModel");

// GET /inventory
exports.getInventory = async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /inventory/:id
exports.getOneInventory = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Item not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /inventory
exports.createItem = async (req, res) => {
    const { name, price, quantity } = req.body;
    try {
        const newItem = new Inventory({ name, price, quantity });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        // Handle duplicate key error (name must be unique)
        if (err.code === 11000) {
            res.status(400).json({ error: "Item name must be unique" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// PUT /inventory/:id
exports.updateItem = async (req, res) => {
    const { name, price, quantity } = req.body;
    try {
        const updated = await Inventory.findByIdAndUpdate(
            req.params.id,
            { name, price, quantity },
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

// DELETE /inventory/:id
exports.deleteItem = async (req, res) => {
    try {
        const deleted = await Inventory.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
