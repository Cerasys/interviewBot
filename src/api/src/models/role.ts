import mongoose from "mongoose";
const Schema = mongoose.Schema;

// name: "Hiring Manager",
// rid: "01",
// iid: ["01", "02"],

const roleSchema = new Schema({
  name: { type: String, required: true },
  interviews: [{ type: mongoose.Types.ObjectId, ref: "Interview" }],
});

export const Role = mongoose.model("Role", roleSchema);
