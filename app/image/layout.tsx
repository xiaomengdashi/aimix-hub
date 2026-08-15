import { ImageStudioRoot } from "@/components/image-studio/image-studio-app";

export const dynamic = "force-dynamic";

/**
 * Keeps ImageStudio mounted while navigating `/image` ↔ `/image/{sessionId}`.
 * Route pages are shells only — same pattern as `app/[provider]/layout.tsx`.
 */
export default function ImageStudioLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<ImageStudioRoot />
			{children}
		</>
	);
}
