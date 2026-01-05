
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const getGeminiStream = async function* (prompt: string, context?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: `You are EtherSense AI, a specialist in Ethereum blockchain and Web3. 
      The current context includes blockchain data: ${context || 'No specific context provided'}.
      Answer concisely, accurately, and professionally. Explain technical concepts simply. 
      Use markdown formatting for lists or emphasis.`,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    }
  });

  for await (const chunk of responseStream) {
    const text = (chunk as GenerateContentResponse).text;
    if (text) {
      yield text;
    }
  }
};
