const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 MCQs
    correctOption: { type: Number, required: true } // Index (0-3) of the correct option
});

const QuizSchema = new mongoose.Schema({
    roundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true, index: true },
    questions: [QuestionSchema]
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = { Quiz, QuestionSchema }; // ✅ Exporting both Quiz and QuestionSchema

