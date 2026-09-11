import Quiz from "../models/Quiz.js";

// ============================================
// CREATE QUIZ
// POST /api/quizzes
// ============================================

export const createQuiz = async (req, res, next) => {
  try {
    const { documentId, title, questions } = req.body;

    // Validation
    if (!documentId || !title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Document ID, title and questions are required",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId,
      title,
      questions,
      totalQuestions: questions.length,
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz created successfully",
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// GET ALL QUIZZES FOR A DOCUMENT
// GET /api/quizzes/:documentId
// ============================================

export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// GET SINGLE QUIZ BY ID
// GET /api/quizzes/quiz/:id
// ============================================

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title fileName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// SUBMIT QUIZ
// POST /api/quizzes/:id/submit
// ============================================

export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide answers as an array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 400,
      });
    }

    let correctCount = 0;
    const userAnswers = [];

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      // Check valid question index
      if (
        typeof questionIndex !== "number" ||
        questionIndex < 0 ||
        questionIndex >= quiz.questions.length
      ) {
        return;
      }

      const question = quiz.questions[questionIndex];

      const isCorrect =
        selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      userAnswers.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      });
    });

    // Score as percentage
    const score = Math.round(
      (correctCount / quiz.totalQuestions) * 100
    );

    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// GET QUIZ RESULTS
// GET /api/quizzes/:id/results
// ============================================

export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz not completed yet",
        statusCode: 400,
      });
    }

    const detailedResults = quiz.questions.map(
      (question, index) => {
        const userAnswer = quiz.userAnswers.find(
          (answer) => answer.questionIndex === index
        );

        return {
          questionIndex: index,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          selectedAnswer:
            userAnswer?.selectedAnswer || null,
          isCorrect:
            userAnswer?.isCorrect || false,
          explanation: question.explanation,
        };
      }
    );

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
        },
        results: detailedResults,
      },
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// DELETE QUIZ
// DELETE /api/quizzes/:id
// ============================================

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};