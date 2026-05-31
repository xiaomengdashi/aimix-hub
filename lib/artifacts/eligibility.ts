import type { ArtifactKind } from "@/lib/artifacts/types";

const PREVIEW_LANGUAGES = new Set([
  "html",
  "htm",
  "jsx",
  "tsx",
  "react",
  "javascript",
  "js",
  "svg",
]);

const REACT_LANGUAGES = new Set(["jsx", "tsx", "react"]);

const MIN_ARTIFACT_LINES = 8;
const MIN_ARTIFACT_CHARS = 180;

export function normalizeArtifactLanguage(language: string | undefined): string {
  return language?.trim().toLowerCase() ?? "";
}

export function inferArtifactKind(language: string): ArtifactKind {
  const lang = normalizeArtifactLanguage(language);
  if (lang === "svg") return "svg";
  if (REACT_LANGUAGES.has(lang)) return "react";
  if (lang === "html" || lang === "htm") return "html";
  return "code";
}

export function looksLikeReactComponent(code: string): boolean {
  return (
    /\bexport\s+default\b/.test(code) ||
    /\bfunction\s+[A-Z]\w*\s*\(/.test(code) ||
    /\bconst\s+[A-Z]\w*\s*=/.test(code) ||
    /<\w+[\s>]/.test(code)
  );
}

export function looksLikeHtmlDocument(code: string): boolean {
  const trimmed = code.trim();
  return (
    /^<!doctype html/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /<(?:head|body|main|section|article|div|span|p|h[1-6]|table|form|button|input|script|style|canvas|svg|iframe|ul|ol|li|nav|header|footer)[\s>/]/i.test(
      trimmed,
    )
  );
}

export function effectiveArtifactLanguage(
  language: string | undefined,
  code: string,
): string {
  const lang = normalizeArtifactLanguage(language);
  if (lang && lang !== "unknown") return lang;
  if (looksLikeHtmlDocument(code)) return "html";
  if (looksLikeReactComponent(code)) return "jsx";
  return "code";
}

export function isArtifactEligible(
  language: string | undefined,
  code: string | undefined,
): boolean {
  if (!code?.trim()) return false;

  const lang = normalizeArtifactLanguage(language);
  const trimmed = code.trim();
  const lineCount = trimmed.split("\n").length;

  if ((!lang || lang === "unknown") && looksLikeHtmlDocument(trimmed)) {
    return lineCount >= 2 || trimmed.length >= 40;
  }

  if (
    (!lang || lang === "unknown") &&
    looksLikeReactComponent(trimmed)
  ) {
    return lineCount >= 2 || trimmed.length >= 40;
  }

  if (PREVIEW_LANGUAGES.has(lang)) {
    if (lang === "javascript" || lang === "js") {
      return looksLikeReactComponent(trimmed) && lineCount >= 3;
    }
    return lineCount >= 3 || trimmed.length >= 80;
  }

  if (lineCount >= MIN_ARTIFACT_LINES || trimmed.length >= MIN_ARTIFACT_CHARS) {
    return true;
  }

  return false;
}

export function supportsArtifactPreview(kind: ArtifactKind): boolean {
  return kind === "html" || kind === "react" || kind === "svg";
}

export function defaultArtifactTitle(language: string, kind: ArtifactKind): string {
  const lang = normalizeArtifactLanguage(language);
  if (kind === "react") return "React 组件";
  if (kind === "html") return "HTML 页面";
  if (kind === "svg") return "SVG 图形";
  if (lang) return lang.toUpperCase();
  return "Artifact";
}

export function resolveArtifactKind(
  language: string,
  content: string,
): ArtifactKind {
  const lang = normalizeArtifactLanguage(language);
  if (lang === "javascript" || lang === "js") {
    return looksLikeReactComponent(content) ? "react" : "code";
  }
  if ((!lang || lang === "unknown") && looksLikeHtmlDocument(content)) {
    return "html";
  }
  if ((!lang || lang === "unknown") && looksLikeReactComponent(content)) {
    return "react";
  }
  return inferArtifactKind(language);
}

export function createArtifactId(
  messageId: string,
  blockIndex: number,
): string {
  return `${messageId}:${blockIndex}`;
}
