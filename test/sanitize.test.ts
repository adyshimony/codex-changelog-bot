import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeXPost, sanitizeXPosts } from "../src/sanitize.js";

test("removes JSON Schema dollar tokens before posting to X", () => {
  assert.equal(
    sanitizeXPost("Supports $schema, $ref, and $defs in local schemas."),
    "Supports schema, ref, and defs in local schemas."
  );
});

test("handles combined JSON Schema token forms", () => {
  assert.equal(
    sanitizeXPost("preserving local $ref/$defs structures"),
    "preserving local ref/defs structures"
  );
});

test("sanitizes every tweet in a thread", () => {
  assert.deepEqual(
    sanitizeXPosts(["Tweet with $ref", "Tweet with $defs", "Tweet with $schema"]),
    ["Tweet with ref", "Tweet with defs", "Tweet with schema"]
  );
});
