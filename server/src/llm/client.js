import Anthropic from "@anthropic-ai/sdk";

import tools from './tools/index.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const SYSTEM_PROMPT = `You are a friendly assistant helping someone describe their family tree in conversation.
Ask clarifying questions whenever a detail is ambiguous or missing.
You have access to tools that can persist the family tree in a database.`;

const TOOLS = Object.keys(tools).map((tool) => {
  return tools[tool].toolDescription
});

function runTool(name, input) {
  console.log("TOOL NAME AND INPUT", name, JSON.stringify(input))
  if (!tools[name]) throw new Error(`Unknown tool: ${name}`);
  console.log(tools[name])
  tools[name].runTool(input)
}

/**
 * Sends a conversation to the model and returns its plain-text reply.
 * Runs an agentic loop: if the model responds with tool_use blocks, the
 * requested tools are executed and their results are fed back until the
 * model returns a plain text reply.
 *
 * @param {Array<{role: "user" | "assistant", content: string}>} messages
 * @returns {Promise<string>}
 */
export async function getChatReply(messages) {
  let conversation = messages;

  while (true) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: conversation,
    });

    const toolUseBlocks = response.content.filter((block) => block.type === "tool_use");
    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((block) => block.type === "text");
      return textBlock?.text ?? "";
    }

    conversation = [
      ...conversation,
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: toolUseBlocks.map((block) => ({
          type: "tool_result",
          tool_use_id: block.id,
          content: runTool(block.name, block.input),
        })),
      },
    ];
  }
}
