const winston = require('winston');

const isServerless = !!process.env.VERCEL;

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'kwanza-manipulus' },
  transports,
});

// If we're not in production, log to console with simple format
if (process.env.NODE_ENV !== 'production' || isServerless) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!isServerless) {
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
}

module.exports = logger;
