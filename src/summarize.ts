import Anthropic from "@anthropic-ai/sdk";
import type { GitHubRelease } from "./github.js";

const client = new Anthropic();

export async function summarizeTweet(release: GitHubRelease): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You are a concise tech news bot for X/Twitter. Summarize the following OpenAI Codex CLI release notes into a single tweet.

Rules:
- Maximum 280 characters total
- Start with "Codex CLI v${release.version}"
- Highlight the 1-2 most impactful changes
- End with the release URL
- No hashtags, no emojis
- Be factual and specific, not hype-y

Release notes (markdown):
${release.body}

Release URL: ${release.url}

Reply with ONLY the tweet text, nothing else.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  if (text.length > 280) {
    console.warn(`Tweet is ${text.length} chars, truncating to 280`);
    return text.slice(0, 277) + "...";
  }

  return text.trim();
}
