import express from "express";
const router = express.Router();
import { register, login, refresh } from "../controllers/authController.js";

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/refresh", refresh);

export default router;