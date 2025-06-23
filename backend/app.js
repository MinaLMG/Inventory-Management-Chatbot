const express = require("express");
const app = express();
require("dotenv").config();
require("./config/db");

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
