// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const plantssb = "5071";
// ---- Middleware dasar ----
app.use(express.json());

// ---- CORS (izinkan semua origin) ----
app.use(
  cors({
    origin: true, // auto reflect request origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);


// ---- Static (optional, taruh index.html & app.js di ./public) ----
app.use(express.static(path.join(__dirname, "public")));

// ---- Health check ----
app.get("/health", (req, res) => {
  res.json({ ok: true, port: process.env.PORT || 3001 });
});

// ---- Routes ----
// Pastikan di ./routes/sow.js dan ./routes/usernfc.js: module.exports = router;
app.use("/sow", require("./routes/sow"));
app.use("/usernfc", require("./routes/usernfc"));
app.use("/workcenter", require("./routes/workcenter"));
app.use("/timesheet", require("./routes/timesheet_transaction"));
// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ---- Start server ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
