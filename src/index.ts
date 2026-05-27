import "dotenv/config";
import { fetchLatestRelease } from "./github.js";
import { summarizeThread } from "./summarize.js";
import { postThread, ThreadPostError } from "./twitter.js";
import { getLastVersion, getPendingThread, setLastVersion, setPendingThread } from "./state.js";
import type { PendingThread } from "./state.js";

const DRY_RUN = process.env.DRY_RUN === "true";

function printPendingThread(pendingThread: PendingThread): void {
  console.log(
    `Incomplete thread for v${pendingThread.version}; refusing to start a fresh thread.`
  );
  console.log(`Last successful tweet ID: ${pendingThread.lastSuccessfulTweetId || "(none)"}`);
  console.log(`Failed at tweet ${pendingThread.failedTweetNumber}. Remaining tweets:`);
  pendingThread.remainingTweets.forEach((tweet, index) => {
    console.log(`\n[${pendingThread.failedTweetNumber + index}] (${tweet.length}/4000)\n${tweet}`);
  });
}

async function main() {
  console.log("Checking for new Codex CLI releases...");

  const release = await fetchLatestRelease();
  if (!release) {
    console.log("No release found. Exiting.");
    return;
  }

  const lastVersion = getLastVersion();
  console.log(`Latest release: v${release.version} | Last posted: v${lastVersion || "(none)"}`);

  const pendingThread = getPendingThread();
  if (pendingThread) {
    printPendingThread(pendingThread);
    return;
  }

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

  try {
    await postThread(tweets);
  } catch (err) {
    if (err instanceof ThreadPostError) {
      setPendingThread({
        version: release.version,
        postedTweetIds: err.postedTweetIds,
        lastSuccessfulTweetId: err.lastSuccessfulTweetId,
        failedTweetNumber: err.failedTweetIndex + 1,
        remainingTweets: err.remainingTweets,
        updatedAt: new Date().toISOString(),
      });
      console.error("\nSaved interrupted thread details to state.json.");
    }
    throw err;
  }

  setLastVersion(release.version);
  console.log(`\nState updated to v${release.version}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
