const User = require('../models/User');
const Round = require('../models/Round');
const { Quiz } = require('../models/Quiz');
const Event = require('../models/Event');
const mongoose = require('mongoose');
const Team = require('../models/Team');
const { validationResult } = require('express-validator');

exports.uploadQuiz = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { roundId, questions } = req.body;

        const round = await Round.findOne({ _id: roundId }).lean();
        if (!round) return res.status(404).json({ message: 'Round not found' });

        const quiz = new Quiz({ roundId, questions });
        await quiz.save();

        res.status(201).json({ message: 'Quiz uploaded successfully', quiz });
    } catch (error) {
        next(error);
    }
};

exports.submitQuiz = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { roundId, answers } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const event = await Event.findOne({ rounds: roundId }).lean();
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const round = await Round.findById(roundId).lean();
        if (!round) {
            return res.status(404).json({ message: 'Round not found for the given event' });
        }

        const quiz = await Quiz.findOne({ roundId }).lean();
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found for the given round' });
        }

        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctOption) {
                score += 1;
            }
        });

        if (event.type === "individual") {
            const userIndex = round.qualifiedUsers.findIndex(user => user.userId?.toString() === userId);
            if (userIndex === -1) {
                return res.status(403).json({ message: 'User is not qualified for this round' });
            }

            round.qualifiedUsers[userIndex].roundPoints += score;
            await round.save();

            await User.findByIdAndUpdate(userId, { $inc: { points: score } });

        } else if (event.type === "team") {
            const team = await Team.findOne({ leader: userId, event: event._id.toString() }).lean();
            if (!team) {
                return res.status(404).json({ message: 'Team not found for this leader in this event' });
            }

            const teamQualifiedIndex = round.qualifiedTeams.findIndex(t => t.teamId?.toString() === team._id.toString());
            if (teamQualifiedIndex === -1) {
                return res.status(403).json({ message: 'Team is not qualified for this round' });
            }

            round.qualifiedTeams[teamQualifiedIndex].roundPoints += score;
            await round.save();

            for (const memberId of team.members) {
                await User.findByIdAndUpdate(memberId, { $inc: { points: score } });
            }
        }

        const nextRound = await Round.findOne({
            eventId: event._id,
            roundNumber: round.roundNumber + 1
        }).lean();

        if (nextRound) {
            if (event.type === "individual") {
                const sortedUsers = round.qualifiedUsers
                    .sort((a, b) => b.roundPoints - a.roundPoints)
                    .slice(0, round.topX);

                nextRound.qualifiedUsers = sortedUsers.map(user => ({
                    userId: user.userId,
                    roundPoints: 0
                }));

                await nextRound.save();
            } else if (event.type === "team") {
                const sortedTeams = round.qualifiedTeams
                    .sort((a, b) => b.roundPoints - a.roundPoints)
                    .slice(0, round.topX);

                nextRound.qualifiedTeams = sortedTeams.map(team => ({
                    teamId: team.teamId,
                    teamName: team.teamName,
                    members: team.members,
                    roundPoints: 0
                }));

                await nextRound.save();
            }
        }

        res.status(200).json({ message: 'Quiz submitted successfully', score });

    } catch (error) {
        next(error);
    }
};

exports.getQuizzesByRoundId = async (req, res, next) => {
    try {
        const { roundId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(roundId)) {
            return res.status(400).json({ message: 'Invalid roundId format' });
        }

        const quizzes = await Quiz.find({ roundId }).lean();

        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: 'No quizzes found for the given roundId' });
        }

        res.status(200).json({ quizzes });
    } catch (error) {
        next(error);
    }
};
