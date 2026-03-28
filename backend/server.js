const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/users",  require("./routes/userRoutes"));
app.use("/api/jobs",   require("./routes/jobRoutes"));
app.use("/api/escrow", require("./routes/escrowRoutes"));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "FreelanceX API is running", version: "2.0" });
});

// ── MongoDB ─────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Blockchain";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });

// ── Listen ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});