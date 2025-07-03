// middleware/session.js
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo";

const store = MongoStore.create({ mongoUrl: MONGO_URL });

const sessionMiddleware = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  },
});

export { sessionMiddleware, store, sessionSecret };
