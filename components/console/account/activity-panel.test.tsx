import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AccountActivityPanel } from "./activity-panel";

it("labels the activity trend with totals instead of relying on bar color", () => {
	render(
		<AccountActivityPanel
			activity={[
				{ date: "2026-08-12", messageCount: 3, threadCount: 1 },
				{ date: "2026-08-13", messageCount: 0, threadCount: 0 },
			]}
		/>,
	);
	expect(
		screen.getByRole("img", {
			name: "近 14 天活跃：共 3 条消息，1 天有活动",
		}),
	).toBeInTheDocument();
	expect(screen.getByText("3 条消息")).toBeInTheDocument();
});
