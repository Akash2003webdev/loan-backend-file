import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  applicantId: mongoose.Schema.Types.ObjectId,
  fileName: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Document", documentSchema);
