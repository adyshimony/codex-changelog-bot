import { TwitterApi } from "twitter-api-v2";

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
  const ids: string[] = [];

  for (let i = 0; i < tweets.length; i++) {
    const options: { text: string; reply?: { in_reply_to_tweet_id: string } } = {
      text: tweets[i],
    };

    if (i > 0 && ids.length > 0) {
      options.reply = { in_reply_to_tweet_id: ids[ids.length - 1] };
    }

    const { data } = await client.v2.tweet(options);
    ids.push(data.id);
    console.log(`Tweet ${i + 1}/${tweets.length} posted: https://x.com/i/status/${data.id}`);
  }

  return ids;
}
