import Flashcard from '../models/Flashcard.js';

// @desc    Get all flashcards for a document
// @route   GET /api/flashcards/:documentId
// @access  Private
// @desc    Create flashcards for a document
// @route   POST /api/flashcards
// @access  Private

export const createFlashcards = async (req, res, next) => {
  try {
    const { documentId, cards } = req.body;

    if (!documentId || !cards || cards.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Document ID and cards are required'
      });
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId,
      cards
    });

    res.status(201).json({
      success: true,
      data: flashcardSet
    });

  } catch (error) {
    next(error);
  }
};
export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user._id,
      documentId: req.params.documentId
    })
      .populate('documentId', 'title fileName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flashcard sets for a user
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({ userId: req.user._id })
      .populate('documentId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark flashcard as reviewed
// @route   POST /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      'cards._id': req.params.cardId,
      userId: req.user._id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set or card not found',
        statusCode: 404
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Card not found in set',
        statusCode: 404
      });
    }

    // Update review info
    flashcardSet.cards[cardIndex].lastReviewed = new Date();
    flashcardSet.cards[cardIndex].reviewCount += 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: 'Flashcard reviewed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle star/favorite on flashcard
// @route   PUT /api/flashcards/:cardId/star
// @access  Private
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      'cards._id': req.params.cardId,
      userId: req.user._id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set or card not found',
        statusCode: 404
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Card not found in set',
        statusCode: 404
      });
    }

    // Toggle star
    flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found',
        statusCode: 404
      });
    }

    await flashcardSet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Flashcard set deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};