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
    status: {
        type: String,
        default: "open",
        enum: ["open", "closed"]
    },
    courier: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    vehicle: String,
    delivery_executive: String,
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
    closed_at: Date
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
