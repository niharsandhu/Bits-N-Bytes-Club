const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log' })
    ]
});

const errorMiddleware = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorMiddleware;
