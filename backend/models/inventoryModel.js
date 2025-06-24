const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // link to the owner of this inventory
        required: true,
    },
    name: {
        type: String,
        required: true,
        // no global unique, uniqueness should be per-user
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

// This enforces uniqueness of (user, name) combination
inventorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);
