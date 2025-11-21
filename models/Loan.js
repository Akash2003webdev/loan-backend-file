import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Loan", loanSchema);
