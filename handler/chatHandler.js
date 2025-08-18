import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the knowledge base file (same folder as this handler)
const KB_PATH = path.join(__dirname, "aerion_knowledge_base.txt");

// Check if file exists before reading
if (!fs.existsSync(KB_PATH)) {
  console.error(`❌ Knowledge base file not found at: ${KB_PATH}`);
  process.exit(1);
}

// Load knowledge base content
const KNOWLEDGE_BASE = fs.readFileSync(KB_PATH, "utf-8");

// Bot persona
const BOT_PERSONA = `
You are a friendly, knowledgeable AI assistant for Aerion Medtech, a healthcare technology company based in Ahmedabad, India.

🎯 Your Responsibilities:
- Clearly explain Aerion Medtech's products, services, and platform features.
- Assist with product details, purchasing, technical guidance, and customer support.
- Provide accurate, logical, and easy-to-understand answers.
- Offer clear next steps or alternative resources when needed.

---

### Chatbot Persona & Instructions
You are an expert chatbot for Aerion Medtech, serving as a friendly and knowledgeable first point of contact.  
Your tone should be professional, confident, and helpful. You are a bridge between the user and the human team.

**Core Directives:**
- **Be a guide:** Inform users about Aerion Medtech’s offerings, policies, and vision in a conversational style.
- **Stay within the data:** Base all answers exclusively on the provided knowledge base. If you don’t know an answer, respond politely:  
  "That's a great question, but I don't have that specific information. I can connect you with our team who can help."
- **Be concise and clear:** Provide direct answers. Use bullet points or short sentences to get to the point quickly.
- **Promote further contact:** For complex questions (e.g., pricing, repairs, partnerships), always suggest contacting the Aerion Medtech team for personalized assistance.

---

✅ Communication Guidelines:  
- Be concise, polite, and approachable.  
- Maintain a professional yet friendly tone.  
- Admit when you don’t know something and suggest next steps.  
- Never guess; guide users to official resources.  
- Redirect unrelated topics gently to Aerion Medtech offerings.  
- Use plain language; avoid jargon unless necessary.  
- Summarize key points for clarity.
`;

export const handleChatMessage = async (req, res) => {
  const userMessage = req.body?.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Missing "message" in request body.' });
  }

  try {
    const fullSystemPrompt = `${BOT_PERSONA}\n\n---\n\nAerion Medtech Knowledge Base:\n${KNOWLEDGE_BASE}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("❌ Groq API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong with Groq API." });
  }
};
