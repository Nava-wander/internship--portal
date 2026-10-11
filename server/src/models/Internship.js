import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, default: "Remote", trim: true },
  type: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "Remote" },
  stipend: { type: String, default: "Unpaid", trim: true },
  description: { type: String, required: true, maxlength: 4000 },
  skills: [{ type: String, trim: true }],
  applyBy: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Internship", internshipSchema);
