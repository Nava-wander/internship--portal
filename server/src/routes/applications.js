import { Router } from "express";
import Application from "../models/Application.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.get("/mine", authenticate, async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate("internship", "title company location type stipend applyBy")
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error) { next(error); }
});
export default router;
