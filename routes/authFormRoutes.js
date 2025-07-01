import express from "express";
const router = express.Router();
import { showLoginForm, register, login, showRegisterForm, logout } from "../controllers/authFormController.js";

router.get("/auth/login", showLoginForm);
router.get("/auth/register", showRegisterForm);

// Xử lý form submit
router.post("/auth/login", login);
router.post("/auth/register", register);

// ✅ Route đăng xuất
router.get("/auth/logout", logout);
export default router;
