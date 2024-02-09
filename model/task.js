import { Schema, model } from "mongoose";

const TaskSchema = new Schema({
    task_id: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ["incoming", "outgoing"]
    },
    is_open: {
        type: Boolean,
        default: true
    },
    courier: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    packages: [{
        type: Schema.Types.ObjectId,
        ref: "Package"
    }],
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
    vehicle_no: String,
    delex_name: String,
    delex_contact: String
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

TaskSchema.pre("save", function (next) {
    // check if status has been updated to closed
    if (this.isModified("status") && this.status === "closed") {
        this.closed_at = Date.now();
    }
    next();
});

export default model("Task", TaskSchema);
