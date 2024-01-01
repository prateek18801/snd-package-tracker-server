const User = require("../model/user");

const getUsers = async (req, res, next) => {

}

const postUsers = async (req, res, next) => {
    try {
        // TODO - validate request body
        const { password, __v, ...user } = (await new User(req.body).save()).toObject();
        return res.status(201).set({
            "location": `/v1/users/${user._id}`
        }).json({
            message: "user created",
            data: user
        });
    } catch (err) {
        next(err);
    }
}

const patchUsers = async (req, res, next) => {

}

const deleteUsers = async (req, res, next) => {
    const id = req.params.id;
    try {
        // TODO - handle invalid ObjectId error
        await User.findByIdAndDelete(id);
        return res.status(204).json();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUsers,
    postUsers,
    patchUsers,
    deleteUsers
};
