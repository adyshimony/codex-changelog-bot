import { fetchLatestRelease } from "./github.js";
import { summarizeTweet } from "./summarize.js";
import { postTweet } from "./twitter.js";
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

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Release notes:\n");
    console.log(release.body);
    console.log(`\nURL: ${release.url}`);
    console.log("(Skipping Claude API and Twitter in dry-run mode)");
    return;
  }

  console.log("Generating tweet...");
  const tweet = await summarizeTweet(release);

  await postTweet(tweet);
  setLastVersion(release.version);
  console.log(`State updated to v${release.version}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
