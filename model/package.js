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
    type: {
        type: String,
        enum: ["outgoing", "incoming"],
        default: "outgoing"
    },
    cancelled: {
        type: Boolean,
        default: false
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
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export default model("Package", PackageSchema);
