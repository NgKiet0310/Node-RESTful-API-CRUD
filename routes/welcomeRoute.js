// routes/welcomeRoute.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/welcome"); // hoặc res.render("welcome")
});

router.get("/welcome", (req, res) => {
  res.render("welcome", { layout: "layouts/main" });
});

export default router;
