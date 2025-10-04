import * as dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testClaude() {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: "user", content: "안녕하세요 !" }],
    });
    console.log(msg.content);
  } catch (error) {
    console.error("Claude API 호출 중 오류 발생:", error);
  }
}

testClaude();
