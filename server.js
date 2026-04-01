const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Routes ───
app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));

// ─── Test Route ───
app.get("/", (req, res) => {
    res.send("Smart Attendance Backend is Running!");
});

// ─── Connect to MongoDB ───
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
.then(() => {
    console.log("MongoDB Connected!");
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection failed:", err.message);
});


// Near the top
const attendanceRoutes = require('./routes/attendance');

// Below your other app.use lines
app.use('/api/attendance', attendanceRoutes);