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
    const id = req.params.id;
    try {
        // TODO - handle invalid ObjectId error
        // TODO - validate request body
        const user = await User.findByIdAndUpdate(id, req.body, { new: true })
            .select({
                __v: 0,
                password: 0
            })
            .lean();

        if (user) {
            return res.status(200).json({
                message: "user updated",
                data: user
            });
        }

        return res.status(400).json({
            message: "user not found"
        });
    } catch (err) {
        next(err);
    }
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
