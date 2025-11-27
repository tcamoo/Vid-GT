import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata } from "../types";

// Initialize Gemini Client
// Note: In a production environment, never expose keys on the client.
// This is structured for the specific provided runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVideoContent = async (
  base64Data: string, 
  mimeType: string
): Promise<VideoMetadata> => {
  try {
    const modelId = "gemini-2.5-flash"; // Efficient for video analysis

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "请分析这个视频。提供一个吸引人的中文标题，一段2句话的中文简介，5个相关的中文标签（Hashtag），以及一个建议的文件名（英文kebab-case格式，带扩展名）。"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            suggestedFilename: { type: Type.STRING }
          },
          required: ["title", "description", "tags", "suggestedFilename"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Gemini 没有返回任何内容");
    }

    const result = JSON.parse(response.text) as VideoMetadata;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("视频内容分析失败: " + (error instanceof Error ? error.message : "未知错误"));
  }
};