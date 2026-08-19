import { describe, expect, it } from "vitest";
import {
  groupThreadIndicesByTime,
  threadTimeGroupLabel,
} from "@/lib/chat/thread-time-groups";

const NOW = Date.parse("2026-08-20T01:00:00.000Z");
const hour = 3_600_000;
const day = 86_400_000;

describe("threadTimeGroupLabel", () => {
  it("buckets exclusive ranges from now", () => {
    expect(threadTimeGroupLabel(NOW - hour, NOW)).toBe("一天内");
    expect(threadTimeGroupLabel(NOW - 2 * day, NOW)).toBe("一周内");
    expect(threadTimeGroupLabel(NOW - 14 * day, NOW)).toBe("一个月内");
    expect(threadTimeGroupLabel(NOW - 200 * day, NOW)).toBe("一年内");
    expect(threadTimeGroupLabel(NOW - 400 * day, NOW)).toBe("一年前");
  });

  it("treats missing timestamps as 一天内", () => {
    expect(threadTimeGroupLabel(undefined, NOW)).toBe("一天内");
  });
});

describe("groupThreadIndicesByTime", () => {
  it("keeps original order inside each bucket and skips empty labels", () => {
    const groups = groupThreadIndicesByTime(
      [
        { lastMessageAt: new Date(NOW - hour) },
        { lastMessageAt: new Date(NOW - 400 * day) },
        { lastMessageAt: new Date(NOW - 3 * hour) },
        { lastMessageAt: new Date(NOW - 10 * day) },
      ],
      NOW,
    );

    expect(groups.map((group) => group.label)).toEqual([
      "一天内",
      "一个月内",
      "一年前",
    ]);
    expect(groups[0]?.indices).toEqual([0, 2]);
    expect(groups[1]?.indices).toEqual([3]);
    expect(groups[2]?.indices).toEqual([1]);
  });
});
