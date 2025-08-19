"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express = require("express");
const CorsOptions = require("cors");
//@ts-ignore
const openai_1 = require("openai");
const app = express();
app.use(CorsOptions());
app.use(express.json());
const client = new openai_1.OpenAI({});
const SYSTEM_PROMPT = `You are Netra, an AI expert in JavaScript and TypeScript.
Always respond in THREE phases: START → THINK (multiple steps) → OUTPUT.
Each reply must be ONLY a single JSON object with:
{"step":"START|THINK|OUTPUT","content":"string"}

Rules:
- Always answer in exactly one JSON object per step.
- The JSON format is:
  {"step":"START|THINK|OUTPUT","content":"string"}
  - you have do all the given steps like START ,THINK , OUTPUT at a time means  ata single time step k=can be held
  - and each should wait for previous step to execute or show properly then next execute
- Never wrap the JSON in markdown (no \`\`\`json or backticks).
- Never include multiple JSON objects in a single reply.
- Always finish with "OUTPUT".
- At a time do one step only and wait for other to execute 
`;
const messages = [
    { role: "system", content: SYSTEM_PROMPT },
];
app.post("/chat", async function (req, res) {
    const { message } = req.body;
    messages.push({ role: "user", content: message });
    const steps = [];
    while (true) {
        try {
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages,
            });
            //@ts-ignore
            let rawContent = response.choices[0].message?.content || "";
            console.log("Raw:", rawContent);
            // Clean model response (remove code fences)
            rawContent = rawContent.replace(/```json|```/g, "").trim();
            let parsedContent;
            try {
                parsedContent = JSON.parse(rawContent);
            }
            catch (err) {
                steps.push({ step: "ERROR", content: rawContent });
                break;
            }
            steps.push(parsedContent); // ✅ push parsed object
            // Add to conversation memory
            messages.push({
                role: "assistant",
                content: JSON.stringify(parsedContent),
            });
            if (parsedContent.step === "OUTPUT") {
                break;
            }
        }
        catch (err) {
            console.error(err);
            steps.push({ step: "ERROR", content: "Something went wrong" });
            break;
        }
    }
    res.json({ steps });
});
app.listen(4000, () => console.log("🚀 Server running on port 4000"));
//# sourceMappingURL=index.js.map