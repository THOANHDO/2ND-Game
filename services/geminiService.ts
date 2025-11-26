import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  async chatWithAssistant(history: { role: string; text: string }[], userMessage: string): Promise<string> {
    if (!apiKey) {
      return "Xin lỗi, tôi chưa được cấu hình API Key. Hãy thêm khóa API vào môi trường.";
    }

    try {
      const model = 'gemini-2.5-flash';
      
      const systemInstruction = `
        Bạn là "NintenBot", một trợ lý ảo chuyên nghiệp và thân thiện của cửa hàng game NintenStore.
        Bạn rất am hiểu về các trò chơi Nintendo (Mario, Zelda, Pokemon, v.v.) và máy chơi game console.
        
        Nhiệm vụ của bạn:
        1. Tư vấn game phù hợp cho khách hàng dựa trên sở thích (hành động, gia đình, giải đố...).
        2. Giải thích cốt truyện hoặc tính năng của sản phẩm một cách hấp dẫn.
        3. Luôn trả lời bằng tiếng Việt, giọng văn vui vẻ, nhiệt tình.
        4. Nếu khách hàng hỏi về giá, hãy nhắc họ xem trực tiếp trên danh sách sản phẩm.
        
        Hãy giữ câu trả lời ngắn gọn (dưới 150 từ) trừ khi được yêu cầu chi tiết.
      `;

      // Convert history to format expected by Gemini 
      // Note: simplistic approach for single turn generation with context manually constructed
      // For proper chat, strictly utilizing generateContent with formatted prompt
      
      let prompt = "";
      history.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Khách' : 'NintenBot'}: ${msg.text}\n`;
      });
      prompt += `Khách: ${userMessage}\nNintenBot:`;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      return response.text || "Xin lỗi, tôi đang suy nghĩ một chút, bạn hỏi lại sau nhé!";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.";
    }
  }
};