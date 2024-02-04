import { Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["executive", "administrator", "manager", "root"],
        default: "executive"
    },
    archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

UserSchema.pre("save", async function (next) {
    // check if the password is modified
    if (this.isModified("password")) {
        // hash the new password
        this.password = await hash(this.password, 10)
    }
    next();
});

UserSchema.methods.match = async function (password) {
    return compare(password, this.password);
}

export default model("User", UserSchema);
