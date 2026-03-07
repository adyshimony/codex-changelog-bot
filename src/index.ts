import "dotenv/config";
import { fetchLatestRelease } from "./github.js";
import { summarizeThread } from "./summarize.js";
import { postThread } from "./twitter.js";
import { getLastVersion, setLastVersion } from "./state.js";

const DRY_RUN = process.env.DRY_RUN === "true";

async function main() {
  console.log("Checking for new Codex CLI releases...");

  const release = await fetchLatestRelease();
  if (!release) {
    console.log("No release found. Exiting.");
    return;
  }

  const lastVersion = getLastVersion();
  console.log(`Latest release: v${release.version} | Last posted: v${lastVersion || "(none)"}`);

  if (release.version === lastVersion) {
    console.log("Already posted this version. Exiting.");
    return;
  }

  console.log("New release detected!");

  console.log("Generating thread...");
  const tweets = await summarizeThread(release);

  console.log(`\nThread (${tweets.length} tweets):`);
  tweets.forEach((t, i) => console.log(`\n[${i + 1}] (${t.length}/4000)\n${t}`));

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Skipping Twitter post.");
    return;
  }

  await postThread(tweets);
  setLastVersion(release.version);
  console.log(`\nState updated to v${release.version}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
