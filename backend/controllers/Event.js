const Event = require('../models/Event');
const Round = require('../models/Round');
const User = require('../models/User');
const Team = require('../models/Team');
const cloudinary = require('../cloudinary');
const fs = require('fs');
const { validationResult } = require('express-validator');

exports.createEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, date, time, location, maxParticipants, byteCoins, type } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: 'events',
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
        });

        fs.unlinkSync(req.file.path); // Remove temp file

        const event = new Event({
            name, description, date, time, location, maxParticipants, byteCoins, type,
            image: {
                url: upload.secure_url,
                public_id: upload.public_id,
            },
        });

        await event.save();
        res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
        next(error);
    }
};

exports.addRound = async (req, res, next) => {
    try {
        const { eventId, roundNumber, roundName, topX, roundType } = req.body;

        const event = await Event.findById(eventId).lean();
        if (!event) return res.status(404).json({ error: "Event not found" });

        const round = new Round({ eventId, roundNumber, roundName, topX, roundType });
        await round.save();

        event.rounds.push(round._id);
        await event.save();

        res.status(201).json({ message: "Round added successfully", round });
    } catch (error) {
        next(error);
    }
};

exports.getAllEvents = async (req, res, next) => {
    try {
        const events = await Event.find().lean();

        const eventsWithRegistrations = events.map(event => ({
            _id: event._id,
            name: event.name,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            maxParticipants: event.maxParticipants,
            byteCoins: event.byteCoins,
            status: event.status,
            totalRegisteredStudents: event.registeredUsers.length,
            totalRounds: event.rounds.length,
            currentRounds: event.rounds.filter(round => round.status === 'ongoing').length || 0,
            type: event.type,
            image: event.image
        }));

        res.status(200).json({ events: eventsWithRegistrations });
    } catch (error) {
        next(error);
    }
};

exports.getEventById = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId)
            .populate({
                path: 'rounds',
                populate: [
                    {
                        path: 'qualifiedUsers.userId',
                        model: 'User',
                        select: 'name email',
                    }
                ]
            })
            .populate({
                path: 'registeredTeams',
                populate: {
                    path: 'members',
                    select: 'name email'
                },
                select: 'teamName members'
            })
            .lean();

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ event });
    } catch (error) {
        next(error);
    }
};

exports.manualSelection = async (req, res, next) => {
    try {
        const { userIds = [], teamIds = [], nextRoundId, action } = req.body;

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Use "accept" or "reject".' });
        }

        const round = await Round.findById(nextRoundId).lean();
        if (!round) {
            return res.status(404).json({ error: 'Round not found.' });
        }

        const { topX, eventType } = round;

        if (action === 'accept') {
            if (eventType === 'user') {
                const alreadySelectedUsers = round.qualifiedUsers.length;
                const availableSlots = Math.max(topX - alreadySelectedUsers, 0);

                const limitedUserIds = userIds.slice(0, availableSlots);

                const users = await User.find({ _id: { $in: limitedUserIds } }).lean();

                const userEntries = users.map(user => ({
                    userId: user._id,
                    roundPoints: 0
                }));

                if (users.length > 0) {
                    await User.updateMany(
                        { _id: { $in: users.map(u => u._id) } },
                        { $inc: { points: 20 } }
                    );
                }

                await Round.findByIdAndUpdate(nextRoundId, {
                    $pull: { qualifiedUsers: { userId: { $in: userEntries.map(u => u.userId) } } }
                });

                await Round.findByIdAndUpdate(nextRoundId, {
                    $push: { qualifiedUsers: { $each: userEntries } }
                });

            } else if (eventType === 'team') {
                const alreadySelectedTeams = round.qualifiedTeams.length;
                const availableSlots = Math.max(topX - alreadySelectedTeams, 0);

                const limitedTeamIds = teamIds.slice(0, availableSlots);

                const teams = await Team.find({ _id: { $in: limitedTeamIds } }).populate('members', 'name email points').lean();

                const teamEntries = teams.map(team => ({
                    teamName: team.name,
                    members: team.members.map(member => ({
                        name: member.name,
                        email: member.email
                    })),
                    roundPoints: 0
                }));

                const allTeamMemberIds = teams.flatMap(team => team.members.map(m => m._id));
                if (allTeamMemberIds.length > 0) {
                    await User.updateMany(
                        { _id: { $in: allTeamMemberIds } },
                        { $inc: { points: 20 } }
                    );
                }

                await Round.findByIdAndUpdate(nextRoundId, {
                    $pull: { qualifiedTeams: { teamName: { $in: teamEntries.map(t => t.teamName) } } }
                });

                await Round.findByIdAndUpdate(nextRoundId, {
                    $push: { qualifiedTeams: { $each: teamEntries } }
                });

            } else {
                return res.status(400).json({ error: 'Invalid event type in round.' });
            }

        } else if (action === 'reject') {
            const teamsToReject = await Team.find({ _id: { $in: teamIds } }).lean();

            await Round.findByIdAndUpdate(nextRoundId, {
                $pull: {
                    qualifiedUsers: { userId: { $in: userIds } },
                    qualifiedTeams: { teamName: { $in: teamsToReject.map(t => t.name) } }
                }
            });
        }

        const updatedRound = await Round.findById(nextRoundId).lean();
        res.status(200).json({
            message: `Users/Teams ${action}ed successfully for next round.`,
            updatedRound
        });
    } catch (error) {
        next(error);
    }
};

exports.qualifyUsersForFirstRound = async (req, res, next) => {
    try {
        const { eventId, userIds } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        if (!userIds || userIds.length === 0) {
            return res.status(400).json({ message: 'No users selected' });
        }

        const firstRound = await Round.findOne({ eventId }).sort({ createdAt: 1 }).lean();
        if (!firstRound) {
            return res.status(404).json({ message: 'First round not found for this event' });
        }

        await Round.findByIdAndUpdate(firstRound._id, {
            $push: {
                qualifiedUsers: { $each: userIds.map(userId => ({ userId, roundPoints: 0 })) }
            }
        });

        await User.updateMany(
            { _id: { $in: userIds } },
            { $inc: { points: 10 } }
        );

        res.status(200).json({
            message: 'Users qualified for the first round successfully',
            qualifiedUsers: userIds,
            firstRoundId: firstRound._id
        });
    } catch (error) {
        next(error);
    }
};

exports.updateEventStatus = async (req, res, next) => {
    const { eventId, status } = req.body;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        event.status = status;
        await event.save();

        res.status(200).json({
            message: 'Event status updated successfully.',
            event,
        });
    } catch (error) {
        next(error);
    }
};

exports.getRecentRegistrations = async (req, res, next) => {
    try {
        const events = await Event.find({ "registeredUsers.0": { $exists: true } })
            .sort({ date: -1 })
            .limit(5)
            .populate('registeredUsers.userId', 'name')
            .lean();

        let recentRegistrations = [];

        events.forEach(event => {
            event.registeredUsers.forEach(regUser => {
                if (regUser.userId) {
                    recentRegistrations.push({
                        id: regUser.userId._id,
                        user: regUser.userId.name,
                        event: event.name,
                        date: new Date(event.date).toISOString().split('T')[0]
                    });
                }
            });
        });

        recentRegistrations.sort((a, b) => new Date(b.date) - new Date(a.date));
        recentRegistrations = recentRegistrations.slice(0, 5);

        res.status(200).json({ registrations: recentRegistrations });
    } catch (error) {
        next(error);
    }
};

exports.scanQRCode = async (req, res, next) => {
    try {
        const { qrData } = req.body;
        const [id, eventId] = qrData.split(',');

        const event = await Event.findById(eventId).lean();
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        const firstRound = await Round.findOne({ eventId: eventId, roundNumber: 1 }).lean();
        if (!firstRound) return res.status(404).json({ message: 'First round not created for this event.' });

        if (event.type === 'team') {
            const team = await Team.findById(id).lean();
            if (!team) return res.status(404).json({ message: 'Team not found.' });

            if (team.event.toString() !== eventId) {
                return res.status(400).json({ message: 'Team not registered for this event.' });
            }

            const alreadyQualified = firstRound.qualifiedTeams.some(qTeam => qTeam.teamName === team.name);
            if (alreadyQualified) {
                return res.status(200).json({ message: 'Team already qualified for first round.' });
            }

            const membersData = await Promise.all(team.members.map(async (memberId) => {
                const user = await User.findById(memberId).lean();
                return { name: user.name, email: user.email };
            }));

            firstRound.qualifiedTeams.push({
                teamName: team.name,
                members: membersData,
                roundPoints: 0
            });
            await firstRound.save();

            return res.status(200).json({ message: 'Team successfully qualified for first round.' });
        }
        else if (event.type === 'individual') {
            const user = await User.findById(id).lean();
            if (!user) return res.status(404).json({ message: 'User not found.' });

            const alreadyQualified = firstRound.qualifiedUsers.some(qUser => qUser.userId.toString() === user._id.toString());
            if (alreadyQualified) {
                return res.status(200).json({ message: 'User already qualified for first round.' });
            }

            firstRound.qualifiedUsers.push({
                userId: user._id,
                roundPoints: 0
            });
            await firstRound.save();

            return res.status(200).json({ message: 'User successfully qualified for first round.' });
        }
        else {
            return res.status(400).json({ message: 'Invalid event type.' });
        }
    } catch (error) {
        next(error);
    }
};
