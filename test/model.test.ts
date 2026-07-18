import assert from "node:assert/strict";
import test from "node:test";
import { pickAnthropicModel } from "../src/model.js";

test("uses an explicit Anthropic model override", () => {
  assert.equal(
    pickAnthropicModel([{ id: "claude-3-5-haiku-20241022" }], " custom-model "),
    "custom-model"
  );
});

test("prefers a known Sonnet model when available", () => {
  assert.equal(
    pickAnthropicModel([
      { id: "claude-3-5-haiku-20241022" },
      { id: "claude-3-7-sonnet-20250219" },
    ]),
    "claude-3-7-sonnet-20250219"
  );
});

test("falls back to the first listed Sonnet model", () => {
  assert.equal(
    pickAnthropicModel([
      { id: "claude-new-haiku" },
      { id: "claude-new-sonnet", display_name: "Claude New Sonnet" },
    ]),
    "claude-new-sonnet"
  );
});

test("falls back to the first available model", () => {
  assert.equal(
    pickAnthropicModel([{ id: "claude-new-haiku" }]),
    "claude-new-haiku"
  );
});
