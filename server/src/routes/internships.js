import { Router } from "express";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim().slice(0, 100);
    const filter = search ? { $or: [
      { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { company: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { skills: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    ] } : {};
    const internships = await Internship.find(filter).populate("createdBy", "name").sort({ createdAt: -1 }).limit(100);
    res.json({ internships });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid internship ID." });
    const internship = await Internship.findById(req.params.id).populate("createdBy", "name");
    if (!internship) return res.status(404).json({ message: "Internship not found." });
    res.json({ internship });
  } catch (error) { next(error); }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title, company, location, type, stipend, description, skills, applyBy } = req.body;
    if (!String(title || "").trim() || !String(company || "").trim() || !String(description || "").trim()) {
      return res.status(400).json({ message: "Title, company, and description are required." });
    }
    const internship = await Internship.create({
      title, company, location, type, stipend, description,
      skills: Array.isArray(skills) ? skills.slice(0, 20).map(s => String(s).trim()).filter(Boolean) : [],
      applyBy: applyBy || undefined, createdBy: req.user.id
    });
    res.status(201).json({ internship });
  } catch (error) { next(error); }
});

router.post("/:id/apply", authenticate, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid internship ID." });
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found." });
    if (internship.applyBy && internship.applyBy < new Date()) return res.status(400).json({ message: "The application deadline has passed." });
    const application = await Application.create({
      internship: internship.id, applicant: req.user.id,
      coverLetter: String(req.body.coverLetter || "").slice(0, 2000)
    });
    res.status(201).json({ application, message: "Application submitted successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already applied to this internship." });
    next(error);
  }
});

export default router;
