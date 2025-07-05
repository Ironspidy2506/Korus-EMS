import mongoose from "mongoose";
const { Schema } = mongoose;

const appraisalSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "department",
      required: true,
    },
    accomplishments: {
      type: String,
    },
    supervisor: [
      {
        type: Schema.Types.ObjectId,
        ref: "employee",
        required: true,
      },
    ],
    supervisorComments: {
      type: String,
    },
    ratings: {
      Punctuality: { type: String },
      JobKnowledge: { type: String },
      DesignAccuracy: { type: String },
      SoftwareProficiency: { type: String },
      DocumentationQuality: { type: String },
      Timeliness: { type: String },
      TaskVolume: { type: String },
      TimeUtilization: { type: String },
      Initiative: { type: String },
      Attendance: { type: String },
    },
    totalRating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Appraisal = mongoose.model("appraisal", appraisalSchema);
export default Appraisal;
