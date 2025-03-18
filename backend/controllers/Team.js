const Team = require('../models/Team');
const User = require('../models/User');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const { validationResult } = require('express-validator');

exports.createTeam = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, eventId } = req.body;
        const leaderId = req.user.id;

        // Check if team name already exists
        const existingTeam = await Team.findOne({ name }).lean();
        if (existingTeam) {
            return res.status(400).json({ message: 'Team name already taken.' });
        }

        // Validate leader
        const leader = await User.findById(leaderId).lean();
        if (!leader) return res.status(404).json({ message: 'Leader not found.' });

        // Validate event
        const event = await Event.findById(eventId).lean();
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (event.type !== 'team') {
            return res.status(400).json({ message: 'Cannot create a team for an individual event.' });
        }

        // Check if the user is already part of a team for this event
        const existingTeamForUser = await Team.findOne({ event: eventId, members: leaderId }).lean();
        if (existingTeamForUser) {
            return res.status(400).json({ message: 'You are already part of a team for this event.' });
        }

        // Create Team
        const team = new Team({
            name,
            leader: leaderId,
            members: [leaderId],
            event: eventId
        });

        await team.save();

        const qrData = `${team._id},${eventId}`;
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        await sendEmail(leader.email, event.name, qrCodeUrl);

        res.status(201).json({ message: 'Team created successfully.', team });
    } catch (error) {
        next(error);
    }
};

const sendEmail = async (to, eventName, qrCodeUrl) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const base64Data = qrCodeUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Registration Confirmed for ${eventName}`,
        html: `
            <h2>Congratulations! You have registered for ${eventName}.</h2>
            <p>Scan the QR code below at the event entrance:</p>
            <p><strong>Event:</strong> ${eventName}</p>
            <p>QR Code will be used for attendance</p>
            <img src="cid:qrCode" alt="QR Code" />
            <p>See you at the event!</p>
        `,
        attachments: [
            {
                filename: "qrcode.png",
                content: qrBuffer,
                encoding: "base64",
                cid: "qrCode",
            },
        ],
    };

    await transporter.sendMail(mailOptions);
};

exports.addTeamMember = async (req, res, next) => {
    try {
        const { teamId, memberRollNo } = req.body;
        const leaderId = req.user.id;

        const team = await Team.findById(teamId).lean();
        if (!team) return res.status(404).json({ message: 'Team not found.' });

        if (String(team.leader) !== leaderId) {
            return res.status(403).json({ message: 'Only team leader can add members.' });
        }

        const member = await User.findOne({ rollNo: memberRollNo }).lean();
        if (!member) return res.status(404).json({ message: 'User to add not found.' });

        if (team.members.includes(member._id)) {
            return res.status(400).json({ message: 'User already in the team.' });
        }

        const event = await Event.findById(team.event).lean();
        if (team.members.length >= event.maxParticipants) {
            return res.status(400).json({ message: 'Team is already full.' });
        }

        team.members.push(member._id);
        await team.save();

        res.status(200).json({ message: 'Member added successfully.', team });
    } catch (error) {
        next(error);
    }
};

exports.getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find().populate('leader members event').lean();
        res.status(200).json({ teams });
    } catch (error) {
        next(error);
    }
};
