const fs = require("fs");
const path = require("path")

module.exports = JSON.parse(fs.readFileSync(path.resolve("config", "config.json")));
