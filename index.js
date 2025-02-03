// import express from "express";
// import cors from "cors";
// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config(); // Load environment variables

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = 5000;
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });

// // Check if API key exists
// if (!GEMINI_API_KEY) {
//   console.error("❌ Error: Gemini API key is missing! Check your .env file.");
//   process.exit(1);
// }

// // Store conversation history
// let conversationHistory = [];

// app.get("/", (req, res) => {
//   res.send("Hello, this is AI CHATBOT backend server");
// });

// app.post("/chat", async (req, res) => {
//   try {
//     const userInput = req.body.message;
//     console.log("Received user input:", userInput);

//     // Add user input to conversation history
//     conversationHistory.push({ role: "user", content: userInput });

//     const requestBody = {
//       contents: [{ parts: [{ text: conversationHistory.map((msg) => msg.content).join("\n") }] }],
//       message: userInput,
//     };

//     const response = await axios.post(GEMINI_API_URL, requestBody, {
//       headers: { "Content-Type": "application/json" },
//     });

//     console.log("Gemini API Response:", response.data);

//     // Extract bot reply from Gemini response
//     const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't understand that.";

//     // Add bot reply to conversation history
//     conversationHistory.push({ role: "bot", content: botReply });

//     // Limit history to last 5 exchanges (to avoid excessive API usage)
//     if (conversationHistory.length > 10) {
//       conversationHistory = conversationHistory.slice(-10);
//     }

//     res.json({ botReply });
//   } catch (error) {
//     console.error("Error from Gemini API:", error.response?.data || error.message);
//     res.status(500).json({
//       error: "Error processing request",
//       details: error.response?.data || error.message,
//     });
//   }
// });

// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";

import express from "express";
import cors from "cors";
// import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();
app.use(
  cors({
    origin:"https://ai-chatbot-backend-lknotplyk-nikhil-limbus-projects.vercel.app",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Check if API key exists
if (!GEMINI_API_KEY) {
  console.error("❌ Error: Gemini API key is missing! Check your .env file.");
  process.exit(1);
}

// Store conversation history
let conversationHistory = [];

app.get("/", (req, res) => {
  res.send("Hello, this is AI CHATBOT backend server");
});

app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body.message;
    console.log("Received user input:", userInput);

    // Add user input to conversation history
    conversationHistory.push({ role: "user", content: userInput });

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = conversationHistory.map((msg) => msg.content).join("\n");

    const response = await model.generateContent(prompt, {
      max_tokens: 100,
    });

    console.log("Gemini API Response:", response.response.text());

    // Extract bot reply from Gemini response
    const botReply = response.response.text();

    // Add bot reply to conversation history
    conversationHistory.push({ role: "bot", content: botReply });

    // Limit history to last 5 exchanges (to avoid excessive API usage)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    res.json({ botReply });
  } catch (error) {
    console.error(
      "Error from Gemini API:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Error processing request",
      details: error.response?.data || error.message,
    });
  }
});
