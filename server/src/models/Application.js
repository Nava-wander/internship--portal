import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: { type: String, trim: true, maxlength: 2000, default: "" },
  status: { type: String, enum: ["Submitted", "Under review", "Shortlisted", "Rejected"], default: "Submitted" }
}, { timestamps: true });

applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });
export default mongoose.model("Application", applicationSchema);
