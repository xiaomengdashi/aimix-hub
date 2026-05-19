/**
 * 联网搜索统一走「先 Tavily 检索、再单次生成」。
 * 经第三方网关（Gemini / MiMo / DeepSeek 等）的 tool loop 常因参数不兼容而失败。
 */
export function shouldPrefetchSearchBeforeChat(_modelId: string): boolean {
  return true;
}
