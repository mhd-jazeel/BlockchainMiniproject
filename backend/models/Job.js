const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    budget: {
        type: Number,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    freelancerAddress: {
        type: String,
        default: null
    },
    blockchainJobId: {
        type: Number,
        default: null
    },
    transactionHash: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "submitted", "completed", "cancelled"],
        default: "open"
    }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);