import { Router } from "express";
import multer from "multer";
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
import { getTemplate, postReconcile } from "../controller/reconcile.js";
import { getPackageReport, getTaskReport } from "../controller/report.js";

const router = Router();
const upload = multer({ dest: "files/" });

// auth routes
router.post("/v1/login", postLogin);

// user routes
router.get("/v1/users/:id?", auth("admin"), getUsers);
router.post("/v1/users", auth("manager"), postUsers);
router.patch("/v1/users/:id", auth("manager"), patchUsers);
router.delete("/v1/users/:id", auth("manager"), archiveUsers);
router.delete("/v1/users/:id/hard", auth("root"), deleteUsers);

// package routes
router.get("/v1/packages/:id?", auth("executive"), getPackages);
router.post("/v1/packages", auth("executive"), postPackages);
router.patch("/v1/packages/:id", auth("executive"), patchPackages);
router.delete("/v1/packages/:id", auth("executive"), deletePackages);

// task routes
router.get("/v1/tasks/:id?", auth("executive"), getTasks);
router.post("/v1/tasks", auth("executive"), postTasks);
router.patch("/v1/tasks/:id", auth("executive"), patchTasks);
router.delete("/v1/tasks/:id", auth("admin"), deleteTasks);

// config routes
router.get("/v1/config/:title?", getConfig);
router.post("/v1/config/:title", auth("admin"), postConfig);

// report routes
router.get("/v1/report/tasks", getTaskReport);
router.get("/v1/report/packages", getPackageReport);

// reco routes
router.get("/v1/template", getTemplate);
router.post("/v1/reconcile", upload.single("sheet"), postReconcile);

// health routes
router.get("/ping", ping);
router.get("/health", auth("admin"), health);
router.post("/health", auth("admin"), health);

export default router;
