import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ltcSchema = new mongoose.Schema({
    // Employee Details
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'employee',
        required: true,
        index: true
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department',
        required: true
    },

    // Service Completion Details (2 years of service)
    serviceCompletionFrom: {
        type: Date,
        required: true
    },
    serviceCompletionTo: {
        type: Date,
        required: true
    },

    // Leave Period Details
    leavePeriodFrom: {
        type: Date,
        required: true
    },
    leavePeriodTo: {
        type: Date,
        required: true
    },

    // Reimbursement Details
    reimbursementAmount: {
        type: Number,
        required: true,
        min: 0
    },

    // Workflow and Approval Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: String,
        default: null
    },

    // Attachments for tax exemption (tickets, bills)
    attachment: {
        fileName: String,
        fileType: String,
        fileData: Buffer
    },
}, {
    timestamps: true
});

const Ltc = mongoose.model('LTC', ltcSchema);
export default Ltc; 