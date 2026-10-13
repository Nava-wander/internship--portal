import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import internshipRoutes from "./routes/internships.js";
import applicationRoutes from "./routes/applications.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://internship-portal-2tpm.vercel.app",
  "https://internship-portal-2tpm-hq5694cjg-projects-22d2.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "internship-portal-api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

app.use((err, _req, res, _next) => {
  console.error("Server error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Request blocked by CORS policy",
    });
  }

  res.status(err.status || 500).json({
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error",
  });
});

const port = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI environment variable.");
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters long.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully.");

    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });