import { TwitterApi } from "twitter-api-v2";
import { sanitizeXPosts } from "./sanitize.js";

export class ThreadPostError extends Error {
  cause: unknown;
  failedTweetIndex: number;
  postedTweetIds: string[];
  remainingTweets: string[];

  constructor(
    message: string,
    failedTweetIndex: number,
    postedTweetIds: string[],
    remainingTweets: string[],
    cause: unknown
  ) {
    super(message);
    this.name = "ThreadPostError";
    this.cause = cause;
    this.failedTweetIndex = failedTweetIndex;
    this.postedTweetIds = postedTweetIds;
    this.remainingTweets = remainingTweets;
  }

  get lastSuccessfulTweetId(): string {
    return this.postedTweetIds[this.postedTweetIds.length - 1] || "";
  }
}

function getClient(): TwitterApi {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error(
      "Missing Twitter API credentials. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET."
    );
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });
}

export async function postThread(tweets: string[]): Promise<string[]> {
  const client = getClient();
  const sanitizedTweets = sanitizeXPosts(tweets);
  const ids: string[] = [];

  for (let i = 0; i < sanitizedTweets.length; i++) {
    const options: { text: string; reply?: { in_reply_to_tweet_id: string } } = {
      text: sanitizedTweets[i],
    };

    if (i > 0 && ids.length > 0) {
      options.reply = { in_reply_to_tweet_id: ids[ids.length - 1] };
    }

    try {
      const { data } = await client.v2.tweet(options);
      ids.push(data.id);
      console.log(
        `Tweet ${i + 1}/${sanitizedTweets.length} posted: https://x.com/i/status/${data.id}`
      );
    } catch (err) {
      const remainingTweets = sanitizedTweets.slice(i);
      console.error(`Tweet ${i + 1}/${sanitizedTweets.length} failed. Stopping thread post.`);
      if (ids.length > 0) {
        console.error(`Last successful tweet ID: ${ids[ids.length - 1]}`);
      }
      console.error("Remaining tweets to resume manually:");
      remainingTweets.forEach((tweet, index) => {
        console.error(`\n[${i + index + 1}] (${tweet.length}/4000)\n${tweet}`);
      });
      throw new ThreadPostError(
        `Failed to post tweet ${i + 1}/${sanitizedTweets.length}`,
        i,
        ids,
        remainingTweets,
        err
      );
    }
  }

  return ids;
}
