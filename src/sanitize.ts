const JSON_SCHEMA_TOKEN = /\$(ref|defs|schema)\b/g;

export function sanitizeXPost(text: string): string {
  return text.replace(JSON_SCHEMA_TOKEN, "$1");
}

export function sanitizeXPosts(tweets: string[]): string[] {
  return tweets.map(sanitizeXPost);
}
