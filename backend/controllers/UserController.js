const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const Message = require("../models/MessageModel");
const jwt = require("jsonwebtoken");

// POST /users/register
exports.register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res
            .status(400)
            .json({ error: "Username and password required" });

    try {
        const hashedPassword = await bcrypt.hash(
            password,
            Number(process.env.PASSWORD_HASH)
        );

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        // Create welcome message from the bot
        const welcomeMessage = new Message({
            user: newUser._id,
            sender: "bot",
            content: `Hello, I'm your friend BotMan. I'm here to help you with your inventory. What would you like to do? You can send messages like: 
                    -   I want to know my inventory.
                    -   Can you tell me about my inventory?
                    -   Please add 8 bags to the inventory at price 15
                    -   What is my inventory now?
                    -   Add 6 nets each one with a cost 33.2
                    -   Show me the whole inventory again
                    -   Can you remove 'ball' item from inventory please?
                    -   Please update the price of bags to 20.4$
                `,
        });

        await welcomeMessage.save(); // ✅ save the message
        res.status(201).json({
            message: "User registered successfully",
            userId: newUser._id,
        });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Username already exists" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// POST /users/login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res
            .status(400)
            .json({ error: "Username and password required" });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Incorrect password" });

        const accessToken = jwt.sign(
            {
                id: user.id,
            },
            process.env.SECRET_KEY
        );

        res.json({
            message: "Login successful",
            userId: user._id,
            username: user.username,
            token: accessToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
