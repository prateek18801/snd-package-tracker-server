import { Schema, model } from "mongoose";
import config from "../utils/config.js";

const PackageSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    outgoing: {
        timestamp: {
            type: Date,
            default: Date.now
        },
        executive: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        remarks: String
    },
    incoming: {
        timestamp: Date,
        executive: {
            type: Schema.Types.ObjectId,
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

export default model("Package", PackageSchema);
