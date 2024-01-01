const router = require("express").Router();

const {
    getUsers,
    postUsers,
    patchUsers,
    deleteUsers
} = require("../controller/user");

const {
    getPackages,
    postPackages,
    patchPackages,
    deletePackages
} = require("../controller/package");

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

module.exports = router;
