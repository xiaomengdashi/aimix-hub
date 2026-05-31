import { normalizeAssistantMarkdown } from "../lib/markdown/normalize-assistant-markdown.ts";
import { micromark } from "micromark";
import { gfm } from "micromark-extension-gfm";

const samples = [
  `**CGNAT（运营商级NAT）**`,
  `* 多个用户共享一个公网 IP\n* 位于运营商侧`,
  `**主要特点：**\n* 多个用户共享一个公网 IP\n* 位于运营商侧`,
  `\`\`\`markdown\n**CGNAT（运营商级NAT）**\n\`\`\``,
  `# 标题\n\n**粗体**`,
  `** CGNAT（运营商级NAT） **`,
  `＊＊CGNAT（运营商级NAT）＊＊`,
];

for (const raw of samples) {
  const norm = normalizeAssistantMarkdown(raw);
  const html = micromark(norm, { extensions: [gfm()] });
  console.log("---");
  console.log("RAW:", JSON.stringify(raw.slice(0, 100)));
  if (norm !== raw) console.log("NORM:", JSON.stringify(norm.slice(0, 100)));
  console.log("HTML:", html.replace(/\s+/g, " ").trim().slice(0, 160));
  console.log(
    "strong:",
    html.includes("<strong>"),
    "ul:",
    html.includes("<ul>"),
    "pre:",
    html.includes("<pre>"),
  );
}
