const TEXT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".json",
  ".csv",
  ".html",
  ".xml",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".css",
  ".yml",
  ".yaml",
]);

export function isTextMediaType(mediaType: string): boolean {
  if (mediaType.startsWith("text/")) return true;
  return (
    mediaType === "application/json" ||
    mediaType === "application/xml" ||
    mediaType === "application/javascript"
  );
}

export function isTextLikeFilename(filename: string, mediaType?: string): boolean {
  if (mediaType && isTextMediaType(mediaType)) return true;
  const lower = filename.toLowerCase();
  for (const ext of TEXT_EXTENSIONS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

export function decodeDataUrlText(url: string): string | null {
  if (!url.startsWith("data:")) return null;
  const comma = url.indexOf(",");
  if (comma === -1) return null;
  const meta = url.slice(5, comma);
  const payload = url.slice(comma + 1);
  if (meta.includes(";base64")) {
    try {
      if (typeof Buffer !== "undefined") {
        return Buffer.from(payload, "base64").toString("utf-8");
      }
      const binary = atob(payload);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }
  try {
    return decodeURIComponent(payload);
  } catch {
    return null;
  }
}

export const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
