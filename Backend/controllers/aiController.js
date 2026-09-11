import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';

import * as geminiService from "../services/geminiservice.js";
import { generateRAGAnswer } from "../services/ragservice.js";


/**
 * Get usable text from a document.
 *
 * Primary source:
 * document.extractedText
 *
 * Fallback:
 * reconstruct text from stored chunks
 */
const getDocumentText = (document) => {
  if (document.extractedText && document.extractedText.trim()) {
    return document.extractedText;
  }

  if (document.chunks && document.chunks.length > 0) {
    return document.chunks
      .map((chunk) => chunk.content)
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
};


/**
 * Generate summary from a document
 */
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404
      });
    }

    const documentText = getDocumentText(document);

    if (!documentText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No document text available for summary generation',
        statusCode: 400
      });
    }

    const summary = await geminiService.generateSummary(
      documentText
    );

    res.status(200).json({
      success: true,
      data: {
        summary
      },
      message: 'Summary generated successfully'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Generate flashcards from a document
 */
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404
      });
    }

    const documentText = getDocumentText(document);

    if (!documentText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No document text available for flashcard generation',
        statusCode: 400
      });
    }

    const flashcards = await geminiService.generateFlashcards(
      documentText,
      count
    );

    const savedFlashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: flashcards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium'
      }))
    });

    res.status(200).json({
      success: true,
      data: savedFlashcardSet,
      message: 'Flashcards generated successfully'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Generate quiz from a document
 */
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404
      });
    }

    const documentText = getDocumentText(document);

    if (!documentText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No document text available for quiz generation',
        statusCode: 400
      });
    }

    const quiz = await geminiService.generateQuiz(
      documentText,
      count
    );

    const savedQuiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: `Quiz - ${document.title || 'Document'}`,
      questions: quiz,
      totalQuestions: quiz.length
    });

    res.status(200).json({
      success: true,
      data: savedQuiz,
      message: 'Quiz generated successfully'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Semantic RAG based chat
 *
 * Flow:
 *
 * User Question
 *      ↓
 * Gemini Embedding
 *      ↓
 * ChromaDB Vector Similarity Search
 *      ↓
 * Top-K Relevant Chunks
 *      ↓
 * Gemini LLM
 *      ↓
 * Grounded Answer
 */
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId and question',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404
      });
    }

    // -----------------------------------------
    // SEMANTIC RAG PIPELINE
    // -----------------------------------------
    const ragResult = await generateRAGAnswer({
      question,
      documentId: document._id,
      userId: req.user._id,
      topK: 5
    });

    const chunkIndices = ragResult.retrievedChunks.map(
      chunk => chunk.chunkIndex
    );

    // -----------------------------------------
    // GET OR CREATE CHAT HISTORY
    // -----------------------------------------
    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: []
      });
    }

    // -----------------------------------------
    // SAVE CONVERSATION
    // -----------------------------------------
    chatHistory.messages.push(
      {
        role: 'user',
        content: question,
        timestamp: new Date(),
        relevantChunks: []
      },
      {
        role: 'assistant',
        content: ragResult.answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices
      }
    );

    await chatHistory.save();

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------
    res.status(200).json({
      success: true,
      data: {
        question,
        answer: ragResult.answer,
        relevantChunks: chunkIndices,
        sources: ragResult.sources,
        chatHistoryId: chatHistory._id
      },
      message: 'Response generated successfully'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Get chat history for a document
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId
    });

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: {
          messages: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Explain a concept
 */
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId and concept',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404
      });
    }

    const documentText = getDocumentText(document);

    if (!documentText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No document text available for concept explanation',
        statusCode: 400
      });
    }

    const explanation = await geminiService.explainConcept(
      concept,
      documentText
    );

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation
      },
      message: 'Concept explained successfully'
    });

  } catch (error) {
    next(error);
  }
};