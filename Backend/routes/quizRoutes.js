import express from 'express';
import {
    createQuiz,
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);
router.post('/', createQuiz);
router.get('/quiz/:id', getQuizById);
router.get('/:id/results', getQuizResults);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);
router.get('/:documentId', getQuizzes);


export default router;