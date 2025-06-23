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
const inventoryRoutes = require("./routes/inventoryRoutes");

app.use(express.json());
app.use("/inventory", inventoryRoutes);

app.get("/", (req, res) => {
    res.send("Server is up and connected");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
