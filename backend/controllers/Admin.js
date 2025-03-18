const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const ClubHead = require('../models/ClubHead');
const EventGallery = require('../models/EventGallery');
const { validationResult } = require('express-validator');

exports.registerCoreTeam = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        const existingMember = await Admin.findOne({ email }).lean();
        if (existingMember) {
            return res.status(400).json({ message: 'Core team member already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const coreTeamMember = new Admin({ name, email, password: hashedPassword, role: 'core-team' });
        await coreTeamMember.save();

        res.status(201).json({ message: 'Core team member registered successfully' });
    } catch (error) {
        next(error);
    }
};

exports.registerAdmin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;
        const existingAdmin = await Admin.findOne({ email }).lean();
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword, role });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const [totalUsers, activeEvents, completedEvents, totalCoinsAgg] = await Promise.all([
            User.countDocuments().lean(),
            Event.countDocuments({ status: 'ongoing' }).lean(),
            Event.countDocuments({ status: 'completed' }).lean(),
            User.aggregate([{ $group: { _id: null, totalCoins: { $sum: "$points" } } }])
        ]);

        const totalCoins = totalCoinsAgg[0]?.totalCoins || 0;

        res.json({
            totalUsers,
            activeEvents,
            completedEvents,
            totalCoins
        });
    } catch (error) {
        next(error);
    }
};

exports.getClubHeads = async (req, res, next) => {
    try {
        const clubHeads = await ClubHead.find().lean();
        res.status(200).json({ clubHeads });
    } catch (error) {
        next(error);
    }
};

exports.getEventGallery = async (req, res, next) => {
    try {
        const gallery = await EventGallery.find().lean();
        res.status(200).json({ gallery });
    } catch (error) {
        next(error);
    }
};
