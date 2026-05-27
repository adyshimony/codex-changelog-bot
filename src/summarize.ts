import Anthropic from "@anthropic-ai/sdk";
import type { GitHubRelease } from "./github.js";
import { sanitizeXPost } from "./sanitize.js";

const client = new Anthropic();

export async function summarizeThread(release: GitHubRelease): Promise<string[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You write changelog updates for X/Twitter about OpenAI Codex CLI. Study this example from @ClaudeCodeLog for tone and format:

Example tweet 1:
"Claude Code 2.1.70 has been released.
1 flag change, 29 CLI changes
Highlights:
• Tool search now works with third-party gateways via ANTHROPIC_BASE_URL, avoiding API 400 errors
• Fixed occasional empty replies immediately after tool search
• Fixed clipboard corruption of non-ASCII text (CJK, emoji) on Windows/WSL
Complete details in thread ↓"

Example tweet 2:
"Codex CLI 0.106.0 changelog:
Fixes:
• Fixed issue description here with specific technical detail
• Another fix with clear explanation of what changed
Improvements:
• Improvement described specifically"

Now create a 4-tweet thread for this OpenAI Codex CLI release.

Rules:
- Each tweet can be up to 4000 characters (X Premium)
- Tweet 1: Short overview. Start with "Codex CLI v${release.version} has been released." Add a count of changes. List top 3 highlights as short headlines (e.g. "Fast mode enabled by default" not a full sentence). End with "Complete details in thread ↓"
- Tweet 2: New features with bullet points. Be specific when the feature needs explanation, but keep it short when the name is self-explanatory. Don't over-explain obvious things.
- Tweet 3: Bug fixes, docs, and other changes. Categorize as "Fixes:", "Docs:", etc. State what was broken and how it's fixed.
- Tweet 4: Full raw changelog — list every item from the Changelog section (commit titles) as bullet points. Skip dependency bumps (@dependabot items). End with "Full release notes:" and the release URL.
- No hashtags, no emojis
- Be technically specific, not vague

Release notes:
${release.body}

Release URL: ${release.url}

Reply with EXACTLY 4 tweets, separated by ---. Nothing else.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const tweets = text
    .split("---")
    .map((t) => sanitizeXPost(t.trim()))
    .filter((t) => t.length > 0);

  for (let i = 0; i < tweets.length; i++) {
    if (tweets[i].length > 4000) {
      console.warn(`Tweet ${i + 1} is ${tweets[i].length} chars, truncating`);
      tweets[i] = tweets[i].slice(0, 3997) + "...";
    }
  }

  return tweets;
}
