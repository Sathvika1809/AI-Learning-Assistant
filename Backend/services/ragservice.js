// Building RAG Orchestration Layer
// Receive the user's question
// Call our new semantic retrieval service
// Get the top relevant chunks from ChromaDB
// Send only those chunks to Gemini
// Return the answer + retrieved source information

import { retrieveRelevantChunks } from "./retrievalservice.js";
import { chatWithContext } from "./geminiservice.js";

/**
 * Generate an answer using Retrieval-Augmented Generation (RAG).
 *
 * Pipeline:
 *
 * User Question
 *      ↓
 * Gemini Embedding
 *      ↓
 * ChromaDB Semantic Search
 *      ↓
 * Top-K Relevant Chunks
 *      ↓
 * Gemini LLM
 *      ↓
 * Grounded Answer
 *
 * @param {Object} params
 * @param {string} params.question - User's question
 * @param {string} params.documentId - Document ID
 * @param {string} params.userId - Authenticated user ID
 * @param {number} params.topK - Number of chunks to retrieve
 *
 * @returns {Promise<Object>}
 */
export const generateRAGAnswer = async ({
  question,
  documentId,
  userId,
  topK = 5,
}) => {
  try {
    // ---------------------------------------------------------
    // STEP 1: Semantic retrieval
    // ---------------------------------------------------------
    const relevantChunks = await retrieveRelevantChunks({
      question,
      documentId,
      userId,
      topK,
    });

    // ---------------------------------------------------------
    // STEP 2: Check whether anything relevant was retrieved
    // ---------------------------------------------------------
    if (!relevantChunks || relevantChunks.length === 0) {
      return {
        answer:
          "I couldn't find relevant information in this document to answer your question.",
        sources: [],
        retrievedChunks: [],
      };
    }

    // ---------------------------------------------------------
    // STEP 3: Send retrieved chunks to Gemini
    // ---------------------------------------------------------
    const answer = await chatWithContext(question, relevantChunks);

    // ---------------------------------------------------------
    // STEP 4: Prepare source information
    // ---------------------------------------------------------
    const sources = relevantChunks.map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      distance: chunk.distance,
    }));

    return {
      answer,
      sources,
      retrievedChunks: relevantChunks,
    };
  } catch (error) {
    console.error("RAG generation error:", error);
    throw error;
  }
};

export default generateRAGAnswer;