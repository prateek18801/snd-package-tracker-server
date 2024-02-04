import { Schema, model } from "mongoose";

const ConfigSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    options: [String]
});

export default model("Config", ConfigSchema);
