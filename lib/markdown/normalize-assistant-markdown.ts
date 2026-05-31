/**
 * 规范化 AI 输出中常见的「类 Markdown」标点，便于 remark-gfm 解析。
 *
 * 注意：不要处理单字符 `*` / `_`，否则会破坏 `* 列表项` 等 GFM 语法。
 */
export function normalizeAssistantMarkdown(text: string): string {
  let result = unwrapMarkdownCodeFence(text);

  result = result
    .replace(/\uFF0A/g, "*")
    .replace(/\uFF3F/g, "_")
    .replace(/[\u2217\u204E\u066D\uFE61]/g, "*");

  result = normalizeSpacedEmphasis(result, "**");
  result = normalizeSpacedEmphasis(result, "__");

  return result;
}

/** AI 常把整段 Markdown 包在 ```markdown 围栏里，导致按代码块展示 */
function unwrapMarkdownCodeFence(text: string): string {
  const trimmed = text.trim();
  const tagged = trimmed.match(/^```(?:markdown|md)\s*\n([\s\S]*?)\n?```\s*$/i);
  if (tagged) return tagged[1]!.replace(/\s+$/, "");

  return text;
}

function normalizeSpacedEmphasis(markdown: string, delimiter: string): string {
  const escaped = delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `${escaped}(?:[\\s\\uFEFF\\u200B-\\u200D\\u2060]+)([^\\n${delimiter[0]!}]+?)(?:[\\s\\uFEFF\\u200B-\\u200D\\u2060]+)${escaped}`,
    "g",
  );

  return markdown.replace(pattern, (_, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return delimiter + delimiter;
    return `${delimiter}${trimmed}${delimiter}`;
  });
}
