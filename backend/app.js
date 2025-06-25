const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const app = express();
// ✅ Allow requests from React dev server
app.use(
    cors({
        origin: "http://localhost:3000", // React app
        credentials: true,
    })
);
app.use(express.json());

const inventoryRoutes = require("./routes/InventoryRoutes");
const userRoutes = require("./routes/UserRoutes");
const messageRoutes = require("./routes/MessageRoutes");

app.use("/users", userRoutes); // /users/register, /users/login
app.use("/messages", messageRoutes); // /messages, POST/GET
app.use("/inventory", inventoryRoutes);

app.get("/", (req, res) => {
    res.send("Server is up and connected");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
