// import { GoogleGenerativeAI } from "@google/generative-ai";

// import express from "express";
// import cors from "cors";
// // import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();
// const PORT = process.env.PORT || 5000;
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const app = express();
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     exposedHeaders: ["Content-Type", "Authorization"],
//     credentials: false,
//   })
// );
// app.use(express.json());

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

//     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     const prompt = conversationHistory.map((msg) => msg.content).join("\n");

//     const response = await model.generateContent(prompt, {
//       max_tokens: 100,
//     });

//     console.log("Gemini API Response:", response.response.text());

//     // Extract bot reply from Gemini response
//     const botReply = response.response.text();

//     // Add bot reply to conversation history
//     conversationHistory.push({ role: "bot", content: botReply });

//     // Limit history to last 5 exchanges (to avoid excessive API usage)
//     if (conversationHistory.length > 10) {
//       conversationHistory = conversationHistory.slice(-10);
//     }

//     res.json({ botReply });
//   } catch (error) {
//     console.error(
//       "Error from Gemini API:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       error: "Error processing request",
//       details: error.response?.data || error.message,
//     });
//   }
// });

// export default app;

import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

if (!OPENROUTER_API_KEY) {
  console.error("❌ Error: OPENROUTER_API_KEY is missing in .env");
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

    conversationHistory.push({ role: "user", content: userInput });

    // Request to Deepseek via OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: conversationHistory,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const botReply =
      response.data.choices?.[0]?.message?.content || "No response";

    console.log("DeepSeek Response:", botReply);

    // Push bot reply into history
    conversationHistory.push({ role: "assistant", content: botReply });

    // Keep only last 10 messages to avoid overload
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    res.json({ botReply });
  } catch (error) {
    console.error(
      "Error from OpenRouter:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      error: "Error processing request",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;