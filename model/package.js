import { Schema, model } from "mongoose";

const PackageSchema = new Schema({
    package_id: {
        type: String,
        required: true,
        unique: true
    },
    courier: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "dispach",
        enum: ["dispatch", "return", "cancel"]
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
        task: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Task"
        },
        remarks: String
    },
    incoming: {
        timestamp: Date,
        executive: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task"
        },
        remarks: String
    },
    created_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export default model("Package", PackageSchema);
