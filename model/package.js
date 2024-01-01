const mongoose = require("mongoose");
const config = require("../utils/config");

const PackageSchema = new mongoose.Schema({
    package_id: {
        type: String,
        required: true,
        unique: true
    },
    courier: {
        type: String,
        required: true,
        enum: config.courier
    },
    channel: {
        type: String,
        required: true,
        enum: config.channel
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    outgoing: {
        timestamp: {
            type: Date,
            default: Date.now
        },
        executive: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        remarks: String
    },
    incoming: {
        timestamp: Date,
        executive: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        remarks: String
    },
    return: {
        type: String,
        default: false
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model("Package", PackageSchema);
