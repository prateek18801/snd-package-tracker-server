import { writeFile } from "fs/promises";
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

        const reportData = packages.map((record, i) => ({
            "SNo": i + 1,
            "Package ID": record.package_id,
            "Type": record.type,
            "Courier": record.courier,
            "Channel": record.channel,
            "Status": record.cancelled ? "cancel" : record.type === "incoming" ? "return" : "dispatch",
            "Executive": `${record.executive.name} (${record.executive.username})`,
            "Task ID": record.task.task_id,
            "Remarks": record.remarks || "",
            "Scanned At": new Date(record.created_at).toLocaleString().toUpperCase()
        }));

        const csvString = json2csv(reportData);
        const reportFilePath = fileURLToPath(new URL('../files/report.csv', import.meta.url));
        await writeFile(reportFilePath, csvString);
        return res.status(200).download(reportFilePath, `REPORT_P_${new Date().toISOString().split("T")[0].replace(/-/g, "").slice(-6)}.csv`);
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

        const reportData = task.packages.map((record, i) => ({
            "SNo": i + 1,
            "Package ID": record.package_id,
            "Type": record.type,
            "Courier": record.courier,
            "Channel": record.channel,
            "Status": record.cancelled ? "cancel" : record.type === "incoming" ? "return" : "dispatch",
            "Executive": `${record.executive.name} (${record.executive.username})`,
            "Task ID": task.task_id,
            "Remarks": record.remarks || "",
            "Scanned At": new Date(record.created_at).toLocaleString().toUpperCase(),
            "Task Status": !i ? task.is_open ? "open" : "closed" : "",
            "Created By": !i ? `${task.created_by.name} (${task.created_by.username})` : "",
            "Vehicle No": !i ? task.vehicle_no : "",
            "Delivery Ex": !i ? task.delex_name : "",
            "Delivery Ph": !i ? task.delex_contact : ""
        }));

        const csvString = json2csv(reportData);
        const reportFilePath = fileURLToPath(new URL('../files/report.csv', import.meta.url));
        await writeFile(reportFilePath, csvString);
        return res.status(200).download(reportFilePath, `REPORT_T${task.task_id}_${new Date().toISOString().split("T")[0].replace(/-/g, "").slice(-6)}.csv`);
    } catch (err) {
        next(err);
    }
}

export {
    getTaskReport,
    getPackageReport
};
