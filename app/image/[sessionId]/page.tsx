export const dynamic = "force-dynamic";

type ImageSessionPageProps = {
	params: Promise<{ sessionId: string }>;
};

/** Route shell only — UI lives in `app/image/layout.tsx`. */
export default async function ImageSessionPage({
	params,
}: ImageSessionPageProps) {
	// Await params so Next still treats this as a valid dynamic segment shell.
	await params;
	return null;
}
