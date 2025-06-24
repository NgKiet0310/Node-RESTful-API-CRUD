// middleware/logger.js
import winston from "winston";
import path from "path";

const logDirectory = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;