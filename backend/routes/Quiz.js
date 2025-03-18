const express = require('express');
const router = express.Router();
const quizController = require('../controllers/Quiz');
const { authMiddleware } = require('../middlewares/Admin');
const { quizValidator, submitQuizValidator, getQuizValidator } = require('../middlewares/validators');

// Core-Team can create a quiz
router.post('/create', authMiddleware(['core-team', 'admin']), quizValidator, quizController.uploadQuiz);

// User submits a quiz
router.post('/submit', authMiddleware(['user']), submitQuizValidator, quizController.submitQuiz);

// Get quizzes by round ID
router.get('/getQuiz/:roundId', getQuizValidator, quizController.getQuizzesByRoundId);

module.exports = router;
