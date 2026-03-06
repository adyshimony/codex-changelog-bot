import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, "..", "state.json");

interface State {
  lastVersion: string;
}

export function getLastVersion(): string {
  try {
    const raw = readFileSync(STATE_PATH, "utf-8");
    const state: State = JSON.parse(raw);
    return state.lastVersion;
  } catch {
    return "";
  }
}

export function setLastVersion(version: string): void {
  const state: State = { lastVersion: version };
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}
