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
router.get("/v1/users/:id?", auth(), getUsers);
router.post("/v1/users", auth(), postUsers);
router.patch("/v1/users/:id", auth(), patchUsers);
router.delete("/v1/users/:id", auth(), deleteUsers);

// package routes
router.get("/v1/packages/:id?", auth(), getPackages);
router.post("/v1/packages", auth(), postPackages);
router.patch("/v1/packages/:id", auth(), patchPackages);
router.delete("/v1/packages/:id", auth(), deletePackages);

// health routes
router.get("/ping", ping);
router.get("/health", auth(), health);
router.post("/health", auth(), health);

export default router;
