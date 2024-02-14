import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { json2csv } from "json-2-csv";
import Task from "../model/task.js";
import Package from "../model/package.js";

const getPackageReport = async (req, res, next) => {
    const { timestamp_gte, timestamp_lte } = req.query;
    try {
        const filter = {};
        for (const key of ["type", "channel", "courier"]) {
            if (req.query[key]) {
                filter[key] = req.query[key];
            }
        }

        if (timestamp_gte && timestamp_lte && new Date(timestamp_gte) < new Date(timestamp_lte)) {
            filter["created_at"] = {
                $gte: `${timestamp_gte}T00:00:00.000+05:30`,
                $lte: `${timestamp_lte}T00:00:00.000+05:30`
            }
        }

        const packages = await Package.find(filter)
            .populate("task", "task_id")
            .populate("executive", "name username")
            .lean();

        const report_data = packages.map(record => ({
            package_id: record.package_id,
            type: record.type,
            courier: record.courier,
            channel: record.channel,
            status: record.cancelled ? "cancel" : record.type === "incoming" ? "return" : "dispatch",
            executive: `${record.executive?.name} (${record.executive?.username})`,
            task_id: record.task?.task_id,
            remarks: record.remarks || "",
            scanned_at: new Date(record.created_at).toLocaleString().toUpperCase()
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
        const task = await Task.findOne({ task_id: req.query.task_id })
            .populate({
                path: "packages",
                populate: { path: "executive", select: "name username" }
            })
            .populate("created_by", "name username")
            .lean();

        const report_data = task.packages.map((record, i) => ({
            package_id: record.package_id,
            type: record.type,
            courier: record.courier,
            channel: record.channel,
            status: record.cancelled ? "cancel" : record.type === "incoming" ? "return" : "dispatch",
            executive: `${record.executive?.name} (${record.executive?.username})`,
            task_id: task.task_id,
            remarks: record.remarks || "",
            scanned_at: new Date(record.created_at).toLocaleString().toUpperCase(),
            task_status: i === 0 ? task.is_open ? "open" : "closed" : "",
            created_by: i === 0 ? `${task.created_by?.name} (${task.created_by?.username})` : "",
            vehicle_no: i === 0 ? task.vehicle_no : "",
            del_ex_name: i === 0 ? task.delex_name : "",
            del_ex_ph: i === 0 ? task.delex_contact : ""
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
    getTaskReport,
    getPackageReport
};
