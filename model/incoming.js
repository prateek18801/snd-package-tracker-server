import { Schema, model } from "mongoose";

const IncomingSchema = new Schema({
    shipment_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    courier: {
        type: String,
        required: true,
        trim: true
    },
    channel: {
        type: String,
        required: true,
        trim: true
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

export default model("Incoming", IncomingSchema, "incoming");
