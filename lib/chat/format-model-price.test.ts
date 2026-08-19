import { describe, expect, it } from "vitest";
import {
  formatModelsDevPrice,
  parsePriceInput,
} from "@/lib/chat/format-model-price";

describe("formatModelsDevPrice", () => {
  it("matches models.dev input/output display", () => {
    expect(formatModelsDevPrice(0.38, 1.88)).toBe("$0.38 / $1.88");
    expect(formatModelsDevPrice(0, 0)).toBe("$0.00 / $0.00");
    expect(formatModelsDevPrice(null, null)).toBe("—");
  });
});

describe("parsePriceInput", () => {
  it("parses empty as unset", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("1.5")).toBe(1.5);
  });
});
