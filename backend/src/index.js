// index.js
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
