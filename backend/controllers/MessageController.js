const Message = require("../models/MessageModel");

// GET /messages
exports.getMessages = async (req, res) => {
    const userId = req.user.id;

    try {
        const messages = await Message.find({ user: userId }).sort({
            timestamp: 1,
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /messages
exports.addMessage = async (req, res) => {
    const userId = req.user.id;
    const { sender, content } = req.body;

    if (!sender || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newMessage = new Message({ user: userId, sender, content });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
