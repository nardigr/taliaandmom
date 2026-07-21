import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hasContentOverrides,
  resolveContentOverride,
  resolveImageOverride,
} from "@/lib/page-content/resolve";

test("resolveContentOverride uses DB value when present", () => {
  const result = resolveContentOverride(
    { title: { value: "Custom title" } },
    "title",
    "Default title",
  );
  assert.equal(result, "Custom title");
});

test("resolveContentOverride falls back when empty", () => {
  const result = resolveContentOverride(
    { title: { value: "  " } },
    "title",
    "Default title",
  );
  assert.equal(result, "Default title");
});

test("resolveImageOverride prefers imageUrl", () => {
  const result = resolveImageOverride(
    { hero: { value: "", imageUrl: "/api/uploads/hero.webp" } },
    "hero",
  );
  assert.equal(result, "/api/uploads/hero.webp");
});

test("hasContentOverrides detects saved sections", () => {
  assert.equal(
    hasContentOverrides({ p1: { value: "text" } }, ["p1", "p2"]),
    true,
  );
  assert.equal(hasContentOverrides({}, ["p1"]), false);
});
