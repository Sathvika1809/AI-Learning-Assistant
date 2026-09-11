import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const EMBEDDING_MODEL = "gemini-embedding-001";

/**
 * Generate an embedding vector for a single text.
 *
 * Used for:
 * - User questions during semantic retrieval
 *
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
  try {
    if (!text || !text.trim()) {
      throw new Error("Text is required to generate an embedding");
    }

    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim(),
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.error("Gemini embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
};

/**
 * Generate embeddings for multiple document chunks
 * using small batches.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export const generateEmbeddings = async (texts) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts are required to generate embeddings");
    }

    const validTexts = texts.map((text) => {
      if (!text || !text.trim()) {
        throw new Error("All texts must contain content");
      }

      return text.trim();
    });

    const BATCH_SIZE = 5;
    const allEmbeddings = [];

    for (let i = 0; i < validTexts.length; i += BATCH_SIZE) {
      const batch = validTexts.slice(i, i + BATCH_SIZE);

      console.log(
        `Generating embeddings for chunks ${i + 1}-${i + batch.length} of ${validTexts.length}...`
      );

      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch,
      });

      const batchEmbeddings = response.embeddings.map(
        (embedding) => embedding.values
      );

      if (batchEmbeddings.length !== batch.length) {
        throw new Error(
          `Embedding count mismatch: expected ${batch.length}, received ${batchEmbeddings.length}`
        );
      }

      allEmbeddings.push(...batchEmbeddings);
    }

    console.log(
      `Successfully generated ${allEmbeddings.length} embeddings`
    );

    return allEmbeddings;
  } catch (error) {
    console.error("Gemini batch embedding error:", error);
    throw new Error("Failed to generate embeddings");
  }
};