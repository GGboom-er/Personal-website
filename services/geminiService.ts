import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMermaidFromContent = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // We strictly assume the user wants a Mindmap or Flowchart based on the text.
    const prompt = `
      Analyze the following article text and create a valid Mermaid.js diagram code that visualizes the key concepts and their relationships. 
      Prefer a 'graph TD' (top-down) or 'mindmap' structure.
      Do not include markdown code blocks (like \`\`\`mermaid). Just return the raw code string.
      The nodes should use Chinese characters if the text is in Chinese.
      Keep it concise but informative.
      
      Article Text:
      ${text.substring(0, 5000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    let code = response.text || '';
    
    // Cleanup markdown if present
    code = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    
    return code;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};