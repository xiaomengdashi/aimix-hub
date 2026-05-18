/** 空状态快捷提示词（点击填入右侧输入框） */
export type ImagePromptSuggestion = {
  title: string;
  prompt: string;
};

export const IMAGE_PROMPT_SUGGESTIONS: ImagePromptSuggestion[] = [
  {
    title: "卡通柴犬",
    prompt: "一只在月球上冲浪的柴犬，卡通插画风格，明亮色彩",
  },
  {
    title: "赛博外滩",
    prompt: "赛博朋克风格的上海外滩夜景，霓虹灯倒映在雨水中，电影感",
  },
  {
    title: "水彩富士山",
    prompt: "水彩画风格的樱花与富士山，柔和色调，留白构图",
  },
  {
    title: "极简咖啡",
    prompt: "极简扁平插画：一杯咖啡与一本打开的书，暖色背景",
  },
];
