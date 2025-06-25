const mongoose = require("mongoose");
require("dotenv").config();

const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};

mongoose.connect(process.env.MONGODB_URI, clientOptions);

const db = mongoose.connection;
db.on("error", (err) => console.error("MongoDB connection error:", err));
db.once("open", () => console.log("Connected to MongoDB"));

module.exports = mongoose;
