const { body,param } = require('express-validator');

exports.registerValidator = [
    body('name')
        .notEmpty()
        .withMessage('Name is required'),

    body('email')
        .isEmail()
        .withMessage('Email is invalid')
        .matches(/^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/)
        .withMessage('Email must be a valid Chitkara email (e.g., abc@chitkara.edu.in)'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

exports.adminValidator = [
    body('role')
        .notEmpty()
        .withMessage('Role is required'),
    ...this.registerValidator
];

exports.teamValidator = [
    body('name')
        .notEmpty().withMessage('Team name is required')
        .isLength({ min: 3 }).withMessage('Team name must be at least 3 characters long'),

    body('eventId')
        .notEmpty().withMessage('Event ID is required')
        .isMongoId().withMessage('Invalid Event ID format'),
];

// Validator for adding a member to a team
exports.addMemberValidator = [
    body('teamId')
        .notEmpty().withMessage('Team ID is required')
        .isMongoId().withMessage('Invalid Team ID format'),

    body('memberRollNo')
        .notEmpty().withMessage('Member roll number is required')
        .isNumeric().withMessage('Member roll number must be numeric'),
];

exports.eventValidator = [
    body('name')
        .notEmpty().withMessage('Event name is required')
        .isLength({ min: 3 }).withMessage('Event name must be at least 3 characters long'),

    body('description')
        .notEmpty().withMessage('Event description is required')
        .isLength({ min: 10 }).withMessage('Event description must be at least 10 characters long'),

    body('date')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid date in YYYY-MM-DD format'),

    body('time')
        .notEmpty().withMessage('Event time is required'),

    body('location')
        .notEmpty().withMessage('Event location is required')
        .isLength({ min: 3 }).withMessage('Event location must be at least 3 characters long'),

    body('maxParticipants')
        .notEmpty().withMessage('Maximum participants is required')
        .isInt({ min: 1 }).withMessage('Maximum participants must be a positive integer'),

    body('byteCoins')
        .notEmpty().withMessage('Byte coins is required')
        .isInt({ min: 0 }).withMessage('Byte coins must be a non-negative integer'),

    body('type')
        .notEmpty().withMessage('Event type is required')
        .isIn(['individual', 'team']).withMessage('Event type must be either "individual" or "team"'),
];

exports.quizValidator = [
    body('roundId')
        .notEmpty().withMessage('Round ID is required')
        .isMongoId().withMessage('Invalid Round ID format'),

    body('questions')
        .notEmpty().withMessage('Questions are required')
        .isArray({ min: 1 }).withMessage('At least one question is required'),

    body('questions.*.questionText')
        .notEmpty().withMessage('Question text is required'),

    body('questions.*.options')
        .notEmpty().withMessage('Options are required')
        .isArray({ min: 4, max: 4 }).withMessage('Exactly 4 options are required'),

    body('questions.*.correctOption')
        .notEmpty().withMessage('Correct option is required')
        .isInt({ min: 0, max: 3 }).withMessage('Correct option must be between 0 and 3')
];

// Validator for submitting a quiz
exports.submitQuizValidator = [
    body('roundId')
        .notEmpty().withMessage('Round ID is required')
        .isMongoId().withMessage('Invalid Round ID format'),

    body('answers')
        .notEmpty().withMessage('Answers are required')
        .isArray({ min: 1 }).withMessage('At least one answer is required'),

    body('answers.*')
        .isInt({ min: 0, max: 3 }).withMessage('Answer must be between 0 and 3')
];

// Validator for getting quizzes by round ID
exports.getQuizValidator = [
    param('roundId')
        .notEmpty().withMessage('Round ID is required')
        .isMongoId().withMessage('Invalid Round ID format')
];