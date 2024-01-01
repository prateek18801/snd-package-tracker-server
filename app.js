const express = require("express");

const app = express();

app.get("/ping", (req, res, next) => {
    return res.status(200).json({
        message: "server running"
    });
});

app.listen(process.env.PORT, () => {
    console.log("server running");
});
