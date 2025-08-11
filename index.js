import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleChatMessage } from "./handler/chatHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse the allowed origins from env variable (comma separated)
const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(",").map(origin => origin.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy does not allow access from the origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Routes
app.post("/chat", handleChatMessage);

// Health check
app.get("/", (req, res) => {
  res.send("Aerion Chatbot API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
