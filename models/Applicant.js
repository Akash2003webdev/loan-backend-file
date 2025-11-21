import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
  loanId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String
});

export default mongoose.model("Applicant", applicantSchema);
