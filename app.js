import express from "express";
import cors from "cors";
import db from "./utils/db.js";
import router from "./router/index.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(router);

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        error: true,
        cause: err.cause,
        message: err.message || "internal server error"
    });
});

app.listen(process.env.PORT, () => {
    console.log("✅ server started");
    db.connect();
});
