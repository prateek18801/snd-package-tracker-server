import fs from "fs";
import path from "path";

const filePath = path.resolve("config", "config.json");
const config = JSON.parse(fs.readFileSync(filePath));

export default config;
