const mongoose = require("mongoose");
const config = require("../utils/config");

const UserSchema = new mongoose.Schema({
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
        enum: config.role,
        default: config.role[0]
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

UserSchema.pre('save', async function (next) {
    // check if the password is modified
    if (this.isModified('password')) {
        // hash the new password
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
});

UserSchema.methods.match = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", UserSchema);
