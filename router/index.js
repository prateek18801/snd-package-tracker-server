import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    getUsers,
    postUsers,
    patchUsers,
    deleteUsers
} from "../controller/user.js";
import {
    getPackages,
    postPackages,
    patchPackages,
    deletePackages,
} from "../controller/package.js";
import { postLogin } from "../controller/auth.js";
import { ping, health } from "../controller/health.js";

const router = Router();

// auth routes
router.post("/v1/login", postLogin);

// user routes
router.get("/v1/users/:id?", auth("administrator"), getUsers);
router.post("/v1/users", auth("manager"), postUsers);
router.patch("/v1/users/:id", auth("manager"), patchUsers);
router.delete("/v1/users/:id", auth("manager"), deleteUsers);

// package routes
router.get("/v1/packages/:id?", auth("executive"), getPackages);
router.post("/v1/packages", auth("executive"), postPackages);
router.patch("/v1/packages/:id", auth("executive"), patchPackages);
router.delete("/v1/packages/:id", auth("administrator"), deletePackages);

// health routes
router.get("/ping", ping);
router.get("/health", auth("administrator"), health);
router.post("/health", auth("administrator"), health);

export default router;
