import { describe, expect, it } from "vitest";
import { filterGatewayModelsByQuery } from "@/lib/admin/filter-gateway-models";

describe("filterGatewayModelsByQuery", () => {
  const models = [
    { id: "gpt-5.4-mini", uiProvider: "chatgpt" },
    { id: "gpt-5.4-pro", uiProvider: "chatgpt" },
    { id: "claude-sonnet-4-6", uiProvider: "claude" },
    { id: "deepseek-v4-pro", uiProvider: "other" },
  ];

  it("returns all models when the query is empty", () => {
    expect(filterGatewayModelsByQuery(models, "  ")).toEqual(models);
  });

  it("matches only the typed id fragment, ignoring provider tabs", () => {
    expect(filterGatewayModelsByQuery(models, "gpt-5.4").map((m) => m.id)).toEqual(
      ["gpt-5.4-mini", "gpt-5.4-pro"],
    );
    expect(
      filterGatewayModelsByQuery(models, "deepseek").map((m) => m.id),
    ).toEqual(["deepseek-v4-pro"]);
  });

  it("ranks exact and prefix matches first", () => {
    expect(
      filterGatewayModelsByQuery(
        [{ id: "gpt-5" }, { id: "gpt-5.4-mini" }, { id: "chatgpt-5" }],
        "gpt-5",
      ).map((m) => m.id),
    ).toEqual(["gpt-5", "gpt-5.4-mini", "chatgpt-5"]);
  });
});
