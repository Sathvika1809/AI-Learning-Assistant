import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  process.exit(1);
}


/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const flashcards = [];
    const cards = generatedText.split('---').filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split('\n');
      let question = '', answer = '', difficulty = 'medium';

      for (const line of lines) {
        if (line.startsWith('Q:')) {
          question = line.substring(2).trim();
        } else if (line.startsWith('A:')) {
          answer = line.substring(2).trim();
        } else if (line.startsWith('D:')) {
          const diff = line.substring(2).trim().toLowerCase();

          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({
          question,
          answer,
          difficulty
        });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate flashcards');
  }
};


/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Format each question as:
Q: [Question]
01: [Option 1]
02: [Option 2]
03: [Option 3]
04: [Option 4]
C: [Correct option - exactly as written above,no need to add option number just add currect option answer value]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate questions with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    
    const questions = [];
    const questionBlocks = generatedText
      .split('---')
      .filter(q => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');

      let question = '';
      let options = [];
      let correctAnswer = '';
      let explanation = '';
      let difficulty = 'medium';

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('Q:')) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^0\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith('C:')) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('E:')) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('D:')) {
          const diff = trimmed.substring(2).trim().toLowerCase();

          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
  console.error('Gemini API error:', error);
  console.error('Gemini API error message:', error?.message);
  console.error('Gemini API error response:', error?.response?.data);
  throw new Error('Failed to generate quiz');
  }
};


/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
};


/**
 * Chat with semantically retrieved document context
 *
 * IMPORTANT:
 * The chunks passed to this function come from the semantic RAG
 * pipeline:
 *
 * Question
 *    ↓
 * Gemini Embedding
 *    ↓
 * ChromaDB Vector Similarity Search
 *    ↓
 * Relevant Chunks
 *    ↓
 * This function
 *    ↓
 * Gemini grounded answer
 *
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Semantically retrieved document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  if (!question || !question.trim()) {
    throw new Error('Question is required');
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    return "I couldn't find relevant information in the document to answer your question.";
  }

  const context = chunks
    .map((chunk, index) => {
      const page =
        chunk.pageNumber !== undefined && chunk.pageNumber !== null
          ? ` | Page: ${chunk.pageNumber}`
          : '';

      const chunkIndex =
        chunk.chunkIndex !== undefined && chunk.chunkIndex !== null
          ? ` | Chunk: ${chunk.chunkIndex}`
          : '';

      return `[Retrieved Context ${index + 1}${chunkIndex}${page}]
${chunk.content}`;
    })
    .join('\n\n');

  const prompt = `You are an AI learning assistant answering questions about a user's uploaded document.

Use ONLY the retrieved document context provided below to answer the question.

Rules:
1. Answer using information supported by the retrieved context.
2. Do not invent facts that are not present in the context.
3. Do not rely on outside knowledge when the context does not support the answer.
4. If the retrieved context does not contain enough information to answer the question, clearly say:
   "I couldn't find enough information in the document to answer this question."
5. Explain the answer clearly and naturally for a student.
6. When useful, combine information from multiple retrieved chunks.
7. Do not mention embeddings, vector databases, retrieval systems, or internal implementation details unless the user specifically asks about them.

Retrieved document context:
${context}

User question:
${question}

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process chat request');
  }
};


/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
Provide a clear, educational explanation that's easy to understand.
Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
};