type CachedImage = {
  bytes: Uint8Array;
  mediaType: string;
  at: number;
};

const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, CachedImage>();

function prune() {
  const now = Date.now();
  for (const [id, entry] of cache) {
    if (now - entry.at > TTL_MS) cache.delete(id);
  }
}

export function storeGeneratedImage(bytes: Uint8Array, mediaType: string): string {
  prune();
  const id = crypto.randomUUID();
  cache.set(id, { bytes, mediaType, at: Date.now() });
  return id;
}

export function getGeneratedImage(
  id: string,
): { bytes: Uint8Array; mediaType: string } | null {
  const entry = cache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    cache.delete(id);
    return null;
  }
  return { bytes: entry.bytes, mediaType: entry.mediaType };
}
