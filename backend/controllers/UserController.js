const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
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
            process.env.PASSWORD_HASH
        );
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
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
    console.log("here");
    const { username, password } = req.body;
    if (!username || !password)
        return res
            .status(400)
            .json({ error: "Username and password required" });

    try {
        console.log("here");

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });
        console.log("here");

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Incorrect password" });
        console.log(user.id);

        const accessToken = jwt.sign(
            {
                id: user.id,
            },
            process.env.SECRET_KEY
        );
        console.log("here2");

        res.json({
            message: "Login successful",
            userId: user._id,
            username: user.username,
            accessToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
