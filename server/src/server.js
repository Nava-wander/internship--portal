import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import internshipRoutes from "./routes/internships.js";
import applicationRoutes from "./routes/applications.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "internship-portal-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Internal server error" });
});

const port = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI. Create server/.env from .env.example.");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API ready on http://localhost:${port}`)))
  .catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
