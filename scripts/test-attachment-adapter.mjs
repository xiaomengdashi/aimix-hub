import { readFileSync } from "node:fs";
import { chatAttachmentAdapter } from "../lib/chat-attachment-adapter.ts";

async function main() {
  const blob = readFileSync(new URL("../README.md", import.meta.url));
  const file = new File([blob], "README.md", { type: "text/markdown" });

  const pending = await chatAttachmentAdapter.add({ file });
  const complete = await chatAttachmentAdapter.send(pending);

  console.log(
    "content:",
    complete.content.map((c) =>
      c.type === "text"
        ? { type: c.type, len: c.text.length, head: c.text.slice(0, 80) }
        : { type: c.type },
    ),
  );

  if (complete.content[0]?.type !== "file") {
    throw new Error("README.md 应作为 file 附件（不在气泡里展示正文）");
  }
  console.log("PASS: README 以 file 附件形式发送");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
