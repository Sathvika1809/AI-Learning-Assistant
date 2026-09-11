import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate an embedding vector using Gemini
 * @param {string} text - Text to convert into an embedding
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
  try {
    if (!text || !text.trim()) {
      throw new Error("Text is required to generate an embedding");
    }

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    return response.embeddings[0].values;

  } catch (error) {
    console.error("Gemini embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
};


/**
 * Generate embeddings for multiple chunks
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export const generateEmbeddings = async (texts) => {
  try {
    const embeddings = [];

    for (const text of texts) {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;

  } catch (error) {
    console.error("Gemini batch embedding error:", error);
    throw new Error("Failed to generate embeddings");
  }
};