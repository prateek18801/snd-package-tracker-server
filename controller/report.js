import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { json2csv } from "json-2-csv";
import Task from "../model/task.js";
import Package from "../model/package.js";

const getPackageReport = async (req, res, next) => {
    const { outgoing_gte, outgoing_lte, incoming_gte, incoming_lte } = req.query;
    try {
        const filter = {};
        for (const key of ["channel", "courier", "status"]) {
            if (req.query[key]) {
                filter[key] = req.query[key];
            }
        }

        if (outgoing_gte && outgoing_lte && new Date(outgoing_gte) < new Date(outgoing_lte)) {
            filter["outgoing.timestamp"] = {
                $gte: `${outgoing_gte}T00:00:00.000+05:30`,
                $lte: `${outgoing_lte}T00:00:00.000+05:30`
            }
        }

        if (incoming_gte && incoming_lte && new Date(incoming_gte) < new Date(incoming_lte)) {
            filter["incoming.timestamp"] = {
                $gte: `${incoming_gte}T00:00:00.000+05:30`,
                $lte: `${incoming_lte}T00:00:00.000+05:30`
            }
        }

        const pkgs = await Package.find(filter).lean();

        const report_data = pkgs.map(record => ({
            package_id: record.package_id,
            courier: record.courier,
            channel: record.channel,
            status: record.status,
            outgoing_ts: new Date(record.outgoing.timestamp).toLocaleString(),
            outgoing_executive: record.outgoing.executive,
            outgoing_task: record.outgoing.task,
            outgoing_remarks: record.outgoing.remarks,
            incoming_ts: (record.incoming?.timestamp && new Date(record.incoming.timestamp).toLocaleString()) || "",
            incoming_executive: record.incoming?.executive || "",
            incoming_task: record.incoming?.task || "",
            incoming_remarks: record.incoming?.remarks || ""
        }));

        const csv_string = json2csv(report_data);
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        const report_path = path.join(__dirname, "..", "report.csv");
        await fs.writeFile(report_path, csv_string);
        return res.status(200).download(report_path, `report.csv`);
    } catch (err) {
        next(err);
    }
}

const getTaskReport = async (req, res, next) => {
    try {
        const task = await Task.findOne({ task_id: req.query.task_id }).populate("packages").lean();

        const report_data = (task.packages || []).map(record => ({
            package_id: record.package_id,
            courier: record.courier,
            channel: record.channel,
            status: record.status,
            outgoing_ts: new Date(record.outgoing.timestamp).toLocaleString(),
            outgoing_executive: record.outgoing.executive,
            outgoing_task: record.outgoing.task,
            outgoing_remarks: record.outgoing.remarks,
            incoming_ts: (record.incoming?.timestamp && new Date(record.incoming.timestamp).toLocaleString()) || "",
            incoming_executive: record.incoming?.executive || "",
            incoming_task: record.incoming?.task || "",
            incoming_remarks: record.incoming?.remarks || ""
        }));

        const csv_string = json2csv(report_data);
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        const report_path = path.join(__dirname, "..", "report.csv");
        await fs.writeFile(report_path, csv_string);
        return res.status(200).download(report_path, `report.csv`);
    } catch (err) {
        next(err);
    }
}

export {
    getPackageReport,
    getTaskReport
};
