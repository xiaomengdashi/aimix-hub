import { getGeneratedImage } from "@/lib/image-generation/cache";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = getGeneratedImage(id);
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.mediaType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
