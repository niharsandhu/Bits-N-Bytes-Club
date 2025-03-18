const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const authRoutes = require('./routes/Admin');
const eventRoutes = require('./routes/Event');
const userRoutes = require('./routes/User');
const quizRoutes = require('./routes/Quiz');
const adminRoutes = require('./routes/Admin');
const teamRoutes = require('./routes/Team');
const uploadRoutes = require('./routes/Upload');
const errorMiddleware = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Adds security headers
app.use(morgan('combined')); // Logging

const corsOptions = {
  origin: ['https://bnb-black.vercel.app', 'http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(errorMiddleware);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/upload', uploadRoutes);

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
