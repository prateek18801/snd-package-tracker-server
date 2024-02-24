import { CronJob } from "cron";
import Task from "../model/task.js";

const job = CronJob.from({
    cronTime: "0 30 23 * * *",
    onTick: async () => {
        try {
            await Task.updateMany({ is_open: true }, { is_open: false });
            console.log("✅ job executed");
        } catch(err) {
            console.log("❌ job failed");
        }
    },
    start: false,
    timeZone: "Asia/Calcutta"
});

export default job;
