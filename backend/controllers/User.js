const User = require('../models/User');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const Team = require('../models/Team');
const cloudinary = require('../cloudinary');
const fs = require('fs');
const { validationResult } = require('express-validator');

exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, department, year, rollNo, password, group } = req.body;

        let user = await User.findOne({ email }).lean();
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            phone,
            rollNo,
            department,
            year,
            group,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        next(error);
    }
};

exports.getMyDetails = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).lean();
        res.status(200).json({
            message: 'User details fetched successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

exports.registerForEvent = async (req, res, next) => {
    try {
        const { eventId, teamId } = req.body;
        const userId = req.user.id;

        const event = await Event.findById(eventId).lean();
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        const user = await User.findById(userId).lean();

        if (event.type === 'team') {
            if (!teamId) {
                return res.status(400).json({ message: "This is a team event. Please create or join a team to participate." });
            }

            const team = await Team.findById(teamId).lean();
            if (!team) {
                return res.status(404).json({ message: "Team not found." });
            }

            if (event.registeredTeams.includes(team._id)) {
                return res.status(400).json({ message: "Team already registered for this event." });
            }

            if (String(team.event) !== String(event._id)) {
                return res.status(400).json({ message: "Team does not belong to this event." });
            }

            event.registeredTeams.push(team._id);

            for (const memberId of team.members) {
                const alreadyRegistered = event.registeredUsers.some(userObj => userObj.userId.equals(memberId));
                if (!alreadyRegistered) {
                    event.registeredUsers.push({ userId: memberId, eventPoints: 0 });
                }

                const eventData = {
                    eventId: event._id,
                    name: event.name,
                    date: event.date,
                    status: "registered",
                };
                await User.findByIdAndUpdate(
                    memberId,
                    { $addToSet: { registeredEvents: eventData } },
                    { new: true }
                );
            }

            await event.save();

            return res.status(200).json({ message: "Team successfully registered for the event.", event });
        } else if (event.type === 'individual') {
            const isAlreadyRegistered = event.registeredUsers.some(userObj => userObj.userId.equals(userId));
            if (isAlreadyRegistered) {
                return res.status(400).json({ message: "You are already registered for this event." });
            }

            event.registeredUsers.push({ userId: userId, eventPoints: 0 });
            await event.save();

            const eventData = {
                eventId: event._id,
                name: event.name,
                date: event.date,
                status: "registered",
            };

            await User.findByIdAndUpdate(
                userId,
                { $push: { registeredEvents: eventData } },
                { new: true }
            );

            const qrData = `${userId},${eventId}`;
            const qrCodeUrl = await QRCode.toDataURL(qrData);
            await sendEmail(user.email, event.name, qrCodeUrl);

            res.status(200).json({ message: "Registered successfully. QR code sent to email.", event });
        } else {
            return res.status(400).json({ message: "Invalid event type." });
        }
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

exports.updateUser = async (req, res, next) => {
    const { userId } = req.params;
    const { group, year, currentPassword, newPassword } = req.body;
    let image = {};

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile-pictures',
                transformation: [{ width: 500, height: 500, crop: 'limit' }],
            });

            image = {
                url: result.secure_url,
                public_id: result.public_id
            };

            fs.unlinkSync(req.file.path); // Remove file from local storage after upload
        }

        if (Object.keys(image).length > 0) {
            user.image = image;
        }

        if (group !== undefined) {
            user.group = group;
        }
        if (year !== undefined) {
            user.year = year;
        }
        if (newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashedPassword;
        }

        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        next(error);
    }
};
