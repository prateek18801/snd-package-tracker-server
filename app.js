const express = require("express");
const cors = require("cors");
const db = require("./utils/db");
const router = require("./router");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(router);

app.get("/ping", (req, res, next) => {
    return res.status(200).json({
        message: "🟢 server running"
    });
});

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        message: err.message,
        error: err.cause || "internal server error"
    });
});

app.listen(process.env.PORT, () => {
    console.log("🟢 server started");
    db.connect();
});
