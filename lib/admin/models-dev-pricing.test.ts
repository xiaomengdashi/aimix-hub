import { describe, expect, it } from "vitest";
import {
  canonicalModelKey,
  lookupModelsDevPrice,
  parseModelsDevIndex,
  scoreModelsDevMatch,
} from "@/lib/admin/models-dev-pricing";

describe("canonicalModelKey", () => {
  it("normalizes dotted versions and date suffixes", () => {
    expect(canonicalModelKey("anthropic/claude-sonnet-4.6")).toBe(
      "claude-sonnet-4-6",
    );
    expect(canonicalModelKey("claude-haiku-4-5-20251001")).toBe(
      "claude-haiku-4-5",
    );
    expect(canonicalModelKey("gpt-5.4-mini")).toBe("gpt-5-4-mini");
  });
});

describe("lookupModelsDevPrice", () => {
  const entries = parseModelsDevIndex({
    openai: {
      id: "openai",
      models: {
        "openai/gpt-5.4-mini": {
          id: "openai/gpt-5.4-mini",
          cost: { input: 0.75, output: 4.5 },
        },
      },
    },
    reseller: {
      id: "reseller",
      models: {
        "gpt-5.4-mini": {
          id: "gpt-5.4-mini",
          cost: { input: 0, output: 0 },
        },
      },
    },
  });

  it("prefers the official provider over a zero-price reseller", () => {
    const found = lookupModelsDevPrice("gpt-5.4-mini", entries, "chatgpt");
    expect(found?.sourceId).toBe("openai/gpt-5.4-mini");
    expect(found?.input).toBe(0.75);
    expect(found?.output).toBe(4.5);
  });

  it("does not match unrelated ids", () => {
    expect(lookupModelsDevPrice("claude-sonnet-4-6", entries, "claude")).toBeNull();
  });
});

describe("scoreModelsDevMatch", () => {
  it("rejects different short names", () => {
    expect(
      scoreModelsDevMatch("gpt-5.4-mini", {
        providerId: "openai",
        sourceId: "openai/gpt-5.5",
        input: 1,
        output: 2,
      }),
    ).toBe(-1);
  });
});
