import { readFile, unlink, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { json2csv } from "json-2-csv";
import Package from "../model/package.js";

const getTemplate = async (req, res, next) => {
    const templateFilePath = fileURLToPath(new URL("../files/template.csv", import.meta.url));
    return res.status(200).download(templateFilePath, `TEMP_${new Date().toISOString().split("T")[0].replace(/-/g, "").slice(-6)}.csv`);
}

const postReconcile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "missing csv file"
            });
        }

        const filter = { type: "incoming" };
        for (const key of ["channel", "courier"]) {
            if (req.body[key]) filter[key] = req.body[key];
        }

        const returns = await Package.find(filter).select({ package_id: 1 }).lean();

        // create set of complete ids
        const completeIdSet = new Set(returns.map(obj => obj.package_id));
        // create set of partial ids(last 6 digits)
        const partialIdSet = new Set(returns.map(obj => obj.package_id.slice(-6)));

        // load uploaded file ids
        const uploadFileContent = await readFile(req.file.path, { encoding: "utf-8" });
        const completeMatchRoundInput = uploadFileContent.split(/\r?\n/);
        const partialMatchRoundInput = [];
        const missingMatchRoundInput = [];

        const completeMatchResult = completeMatchRoundInput.map(id => {
            // check uploaded ids match complete ids
            if (completeIdSet.has(id)) {
                return {
                    "Package ID": id,
                    "Result": "MATCH"
                }
            }
            // push to partial check input
            partialMatchRoundInput.push(id);
            return null;
        });

        const partialMatchResult = partialMatchRoundInput.map(id => {
            // check unmatched ids match partial ids
            if (partialIdSet.has(id.slice(-6))) {
                return {
                    "Package ID": id,
                    "Result": "PARTIAL"
                }
            }
            // push to missing input
            missingMatchRoundInput.push(id);
            return null;
        });

        const missingMatchResult = missingMatchRoundInput.map(id => {
            if (id) {
                return {
                    "Package ID": id,
                    "Result": "MISSING"
                }
            }
            return null;
        });

        const csvString = json2csv([...completeMatchResult, ...partialMatchResult, ...missingMatchResult].filter(x => x));
        const recoFilePath = fileURLToPath(new URL('../files/result.csv', import.meta.url));
        await writeFile(recoFilePath, csvString);
        res.status(200).download(recoFilePath, `RECO_${new Date().toISOString().split("T")[0].replace(/-/g, "").slice(-6)}.csv`);
        await unlink(req.file.path);
    } catch (err) {
        next(err);
    }
}

export {
    getTemplate,
    postReconcile
};
