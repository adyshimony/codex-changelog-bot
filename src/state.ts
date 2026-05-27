import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, "..", "state.json");

interface State {
  lastVersion?: string;
  pendingThread?: PendingThread;
}

export interface PendingThread {
  version: string;
  postedTweetIds: string[];
  lastSuccessfulTweetId: string;
  failedTweetNumber: number;
  remainingTweets: string[];
  updatedAt: string;
}

function readState(): State {
  try {
    const raw = readFileSync(STATE_PATH, "utf-8");
    return JSON.parse(raw) as State;
  } catch {
    return {};
  }
}

function writeState(state: State): void {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

export function getLastVersion(): string {
  return readState().lastVersion || "";
}

export function setLastVersion(version: string): void {
  const state = readState();
  state.lastVersion = version;
  delete state.pendingThread;
  writeState(state);
}

export function getPendingThread(): PendingThread | undefined {
  return readState().pendingThread;
}

export function setPendingThread(pendingThread: PendingThread): void {
  const state = readState();
  state.pendingThread = pendingThread;
  writeState(state);
}
