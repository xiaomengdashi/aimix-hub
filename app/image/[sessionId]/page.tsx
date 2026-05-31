import { ImageStudioRoot } from "@/components/image-studio/image-studio-app";

export const dynamic = "force-dynamic";

type ImageSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function ImageSessionPage({ params }: ImageSessionPageProps) {
  const { sessionId } = await params;
  return <ImageStudioRoot sessionId={sessionId} />;
}
