const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'your_jwt_secret';

exports.login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        let user;

        if (role === 'admin' || role === 'core-team') {
            user = await Admin.findOne({ email }).lean();
        } else {
            user = await User.findOne({ email }).lean();
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: role || 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (error) {
        next(error);
    }
};
