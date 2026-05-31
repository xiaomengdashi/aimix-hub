function escapeClosingScript(value: string): string {
  return value.replace(/<\/script/gi, "<\\/script");
}

const ARTIFACT_PREVIEW_BASE_STYLE = `<style data-artifact-preview-base>
  html {
    height: 100% !important;
    overflow: auto !important;
    overflow-x: hidden !important;
  }
  body {
    min-height: 100% !important;
    height: auto !important;
    overflow: auto !important;
    overflow-x: hidden !important;
    max-height: none !important;
  }
</style>`;

const ARTIFACT_PREVIEW_BASE_SCRIPT = `<script data-artifact-preview-base>
  (function () {
    function unlockNode(node) {
      if (!node || !node.style) return;
      var cs = window.getComputedStyle(node);
      var height = cs.height;
      var overflowY = cs.overflowY;
      var position = cs.position;
      var shouldFix =
        overflowY === "hidden" ||
        overflowY === "clip" ||
        height === "100vh" ||
        height === "100dvh" ||
        (position === "fixed" && cs.top === "0px" && cs.bottom === "0px");
      if (!shouldFix && node !== document.documentElement && node !== document.body) {
        return;
      }
      if (node === document.documentElement) {
        node.style.setProperty("height", "100%", "important");
        node.style.setProperty("overflow", "auto", "important");
        node.style.setProperty("overflow-x", "hidden", "important");
        return;
      }
      if (node === document.body) {
        node.style.setProperty("min-height", "100%", "important");
        node.style.setProperty("height", "auto", "important");
        node.style.setProperty("overflow", "auto", "important");
        node.style.setProperty("overflow-x", "hidden", "important");
        node.style.setProperty("max-height", "none", "important");
        return;
      }
      node.style.setProperty("overflow", "visible", "important");
      node.style.setProperty("overflow-y", "visible", "important");
      node.style.setProperty("height", "auto", "important");
      node.style.setProperty("max-height", "none", "important");
      if (position === "fixed") {
        node.style.setProperty("position", "relative", "important");
        node.style.setProperty("inset", "auto", "important");
      }
    }

    function unlockScroll() {
      unlockNode(document.documentElement);
      unlockNode(document.body);
      if (!document.body) return;
      var nodes = document.body.querySelectorAll("*");
      for (var i = 0; i < nodes.length && i < 300; i++) {
        unlockNode(nodes[i]);
      }
    }

    unlockScroll();
    window.addEventListener("load", unlockScroll);
    [50, 150, 400, 1000, 2500].forEach(function (delay) {
      window.setTimeout(unlockScroll, delay);
    });
  })();
</script>`;

function injectPreviewBaseStyles(html: string): string {
  const injection = `${ARTIFACT_PREVIEW_BASE_STYLE}\n${ARTIFACT_PREVIEW_BASE_SCRIPT}`;
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${injection}\n</head>`);
  }
  if (/<html[\s>]/i.test(html)) {
    return html.replace(
      /<html([^>]*)>/i,
      `<html$1><head>${injection}</head>`,
    );
  }
  return html;
}

export function buildHtmlPreviewDocument(content: string): string {
  const trimmed = content.trim();
  if (/^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return injectPreviewBaseStyles(trimmed);
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${ARTIFACT_PREVIEW_BASE_STYLE}
    ${ARTIFACT_PREVIEW_BASE_SCRIPT}
    <style>
      html, body { margin: 0; min-height: 100%; background: #fff; color: #111; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
${trimmed}
  </body>
</html>`;
}

export function buildSvgPreviewDocument(content: string): string {
  const trimmed = content.trim();
  return injectPreviewBaseStyles(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body { margin: 0; min-height: 100%; display: grid; place-items: center; background: #fff; }
      svg { max-width: 100%; max-height: 100%; }
    </style>
  </head>
  <body>
${trimmed}
  </body>
</html>`);
}

function prepareReactSource(code: string): string {
  let source = code.trim();
  source = source.replace(/^import\s+.+?;?\s*$/gm, "");
  source = source.replace(/^export\s+default\s+/m, "");
  source = source.replace(/^export\s+/gm, "");

  const componentMatch =
    source.match(/(?:function|const)\s+([A-Z][A-Za-z0-9_]*)/) ??
    source.match(/(?:function|const)\s+([A-Za-z][A-Za-z0-9_]*)/);

  const componentName = componentMatch?.[1] ?? "App";

  if (!/createRoot\(|ReactDOM\.render\(/.test(source)) {
    source += `\n\nconst __artifactRoot = ReactDOM.createRoot(document.getElementById("root"));\n__artifactRoot.render(React.createElement(${componentName}));\n`;
  }

  return source;
}

export function buildReactPreviewDocument(content: string): string {
  const source = escapeClosingScript(prepareReactSource(content));

  return injectPreviewBaseStyles(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      html, body, #root { margin: 0; min-height: 100%; background: #fff; color: #111; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react">
${source}
    </script>
  </body>
</html>`);
}

export function buildArtifactPreviewDocument(
  kind: "html" | "react" | "svg",
  content: string,
): string {
  if (kind === "react") return buildReactPreviewDocument(content);
  if (kind === "svg") return buildSvgPreviewDocument(content);
  return buildHtmlPreviewDocument(content);
}
