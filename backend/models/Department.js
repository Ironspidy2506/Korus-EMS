import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    departmentId: {
        type: String,
        required: true
    },
    departmentName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
}, {
    timestamps: true,
});

const Department = mongoose.model("department", departmentSchema);
export default Department;