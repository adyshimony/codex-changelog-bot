export interface GitHubRelease {
  version: string;
  body: string;
  date: string;
  url: string;
}

export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  const response = await fetch(
    "https://api.github.com/repos/openai/codex/releases/latest",
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "codex-changelog-bot",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("No releases found for openai/codex");
      return null;
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.prerelease) {
    console.log(`Skipping pre-release: ${data.tag_name}`);
    return null;
  }

  const version = data.tag_name.replace(/^(rust-)?v/, "");

  return {
    version,
    body: data.body ?? "",
    date: data.published_at ?? data.created_at,
    url: data.html_url,
  };
}
