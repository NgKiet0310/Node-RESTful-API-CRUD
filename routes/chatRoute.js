import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("chat", { layout: false }); // không dùng layout
});

export default router;
