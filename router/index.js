import { Router } from "express";
import { postLogin } from "../controller/auth.js";
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

const router = Router();

// auth routes
router.post("/v1/login", postLogin);

// user routes
router.get("/v1/users/:id?", getUsers);
router.post("/v1/users", postUsers);
router.patch("/v1/users/:id", patchUsers);
router.delete("/v1/users/:id", deleteUsers);

// package routes
router.get("/v1/packages/:id?", getPackages);
router.post("/v1/packages", postPackages);
router.patch("/v1/packages/:id", patchPackages);
router.delete("/v1/packages/:id", deletePackages);

export default router;
