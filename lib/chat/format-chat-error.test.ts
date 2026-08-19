import { APICallError } from "@ai-sdk/provider";
import { describe, expect, it } from "vitest";
import { formatChatErrorMessage } from "@/lib/chat/format-chat-error";

describe("formatChatErrorMessage", () => {
  it("maps JSON HTTP error bodies from the chat client", () => {
    expect(
      formatChatErrorMessage(
        new Error(JSON.stringify({ error: "Invalid model" })),
      ),
    ).toBe("当前模型不可用或网关未开通该模型，请更换模型后再试。");
  });

  it("maps gateway 503 APICallError", () => {
    expect(
      formatChatErrorMessage(
        new APICallError({
          message: "Bad Gateway",
          url: "https://example.test/v1/chat/completions",
          requestBodyValues: {},
          statusCode: 503,
          responseBody: "overloaded",
        }),
      ),
    ).toBe("大模型暂时不可用，请稍后重试或更换模型。");
  });

  it("keeps short Chinese server messages", () => {
    expect(
      formatChatErrorMessage(
        new Error(
          JSON.stringify({
            error: "AI 网关未配置：请在 /admin/models 设置 Base URL 与 API Key",
          }),
        ),
      ),
    ).toBe("AI 网关未配置：请在 /admin/models 设置 Base URL 与 API Key");
  });

  it("hides HTML 500 pages", () => {
    expect(
      formatChatErrorMessage(new Error("<!DOCTYPE html><html>oops</html>")),
    ).toBe("大模型暂时不可用，请稍后重试或更换模型。");
  });
});
