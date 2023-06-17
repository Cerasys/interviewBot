import mongoose from "mongoose";
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
  /**
   * Canidates name. e.g. "Alex Smith"
   */
  name: { type: String, required: true },
  /**
   * Candidates email. e.g. "AlexSmit@gmail.com"
   */
  email: { type: String, required: true },
});

export const Candidate = mongoose.model("Candidate", candidateSchema);
