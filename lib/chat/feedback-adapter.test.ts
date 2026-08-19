import { expect, it } from "vitest";
import { isMessageFeedbackType } from "./feedback-adapter";

it("accepts positive and negative feedback types", () => {
  expect(isMessageFeedbackType("positive")).toBe(true);
  expect(isMessageFeedbackType("negative")).toBe(true);
  expect(isMessageFeedbackType("neutral")).toBe(false);
  expect(isMessageFeedbackType(null)).toBe(false);
});
