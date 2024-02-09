import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    getUsers,
    postUsers,
    patchUsers,
    deleteUsers,
    archiveUsers
} from "../controller/user.js";
import {
    getPackages,
    postPackages,
    patchPackages,
    deletePackages,
} from "../controller/package.js";
import {
    getTasks,
    postTasks,
    patchTasks,
    deleteTasks
} from "../controller/task.js";
import { postLogin } from "../controller/auth.js";
import { ping, health } from "../controller/health.js";
import { getConfig, postConfig } from "../controller/config.js";
import { getPackageReport, getTaskReport } from "../controller/report.js";

const router = Router();

// auth routes
router.post("/v1/login", postLogin);

// user routes
router.get("/v1/users/:id?", auth("administrator"), getUsers);
router.post("/v1/users", auth("manager"), postUsers);
router.patch("/v1/users/:id", auth("manager"), patchUsers);
router.delete("/v1/users/:id", auth("manager"), archiveUsers);
router.delete("/v1/users/:id/hard", auth("root"), deleteUsers);

// package routes
router.get("/v1/packages/:id?", auth("executive"), getPackages);
router.post("/v1/packages", auth("executive"), postPackages);
router.patch("/v1/packages/:id", auth("executive"), patchPackages);
router.delete("/v1/packages/:id", auth("administrator"), deletePackages);

// task routes
router.get("/v1/tasks/:id?", auth("executive"), getTasks);
router.post("/v1/tasks", auth("executive"), postTasks);
router.patch("/v1/tasks/:id", auth("executive"), patchTasks);
router.delete("/v1/tasks/:id", auth("administrator"), deleteTasks);

// config routes
router.get("/v1/config/:title?", getConfig);
router.post("/v1/config/:title", postConfig);

// report routes
router.get("/v1/report/tasks", getTaskReport);
router.get("/v1/report/packages", getPackageReport);

// health routes
router.get("/ping", ping);
router.get("/health", auth("administrator"), health);
router.post("/health", auth("administrator"), health);

export default router;
