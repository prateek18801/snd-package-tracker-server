import mongoose from "mongoose";

async function connect() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("✅ db connected");
    } catch (err) {
        console.log("❌ db connection failed", err.code);
    }
    mongoose.connection.on("disconnected", () => {
        console.log("❌ db disconnected")
    });
    mongoose.connection.on("reconnected", () => {
        console.log("✅ db reconnected")
    });
    const gracefulExit = async () => {
        await mongoose.connection.close();
        process.exit(0);
    }
    process.on("SIGINT", gracefulExit);
    process.on("SIGTERM", gracefulExit);
}

export default { connect };
