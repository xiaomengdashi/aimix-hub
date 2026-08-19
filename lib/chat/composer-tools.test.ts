import { describe, expect, it } from "vitest";
import {
  composerToolNeedsWebSearch,
  parseComposerToolId,
} from "@/lib/chat/composer-tools";

describe("composer tools", () => {
  it("parses known tool ids", () => {
    expect(parseComposerToolId("search")).toBe("search");
    expect(parseComposerToolId("research")).toBe("research");
    expect(parseComposerToolId("nope")).toBeNull();
  });

  it("marks search and research as web tools", () => {
    expect(composerToolNeedsWebSearch("search")).toBe(true);
    expect(composerToolNeedsWebSearch("research")).toBe(true);
    expect(composerToolNeedsWebSearch("think")).toBe(false);
    expect(composerToolNeedsWebSearch("study")).toBe(false);
    expect(composerToolNeedsWebSearch(null)).toBe(false);
  });
});
