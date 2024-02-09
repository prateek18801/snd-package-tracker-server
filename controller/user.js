import { isValidObjectId } from "mongoose";
import User from "../model/user.js";

const getUsers = async (req, res, next) => {
    try {
        if (req.params.id) {
            if (!isValidObjectId(req.params.id)) {
                const error = new Error("invalid id");
                error.status = 400;
                throw error;
            }
            const user = await User.findById(req.params.id)
                .select({ password: 0 })
                .lean();
            return res.status(200).json({
                message: "user found",
                data: user
            });
        }

        // create filter for requested fields
        const filter = {};
        Object.keys(req.query).forEach(key => {
            if (key !== "page" && key !== "limit") {
                filter[key] = req.query[key];
            }
        });

        const page = req.query.page ? Math.max(+req.query.page, 1) : 1;
        const limit = req.query.limit ? Math.max(+req.query.limit, 1) : 1000;
        const user = await User.find(filter)
            .select({ password: 0 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total_count = await User.estimatedDocumentCount();
        const total_pages = Math.ceil(total_count / limit);
        const prev_page = Math.max(page - 1, 1);
        const next_page = Math.min(page + 1, total_pages);

        return res.status(200).set({
            "x-total-count": total_count,
            "link": `</v1/users?page=${page}&per_page=${limit}>;rel="self",</v1/users?page=${next_page}&per_page=${limit}>;rel="next",</v1/users?page=${prev_page}&per_page=${limit}>;rel="previous",</v1/users?page=1&per_page=${limit}>;rel="first",</v1/users?page=${total_pages}&per_page=${limit}>;rel="last",`
        }).json({
            metadata: {
                page,
                limit,
                total_count,
                total_pages,
                links: {
                    self: `/v1/users?page=${page}&per_page=${limit}`,
                    next: `/v1/users?page=${next_page}&per_page=${limit}`,
                    prev: `/v1/users?page=${prev_page}&per_page=${limit}`,
                    first: `/v1/users?page=1&per_page=${limit}`,
                    last: `/v1/users?page=${total_pages}&per_page=${limit}`
                }
            },
            data: user
        });
    } catch (err) {
        next(err);
    }
}

const postUsers = async (req, res, next) => {
    try {
        const data = {
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            role: req.body.role ? req.body.role.toLowerCase() : "executive",
        }
        // validate required fields
        Object.keys(data).forEach(key => {
            if (!data[key]) {
                const error = new Error(`missing ${key} field`);
                error.status = 400;
                throw error;
            }
        });
        const user = await new User(data).save();
        return res.status(201)
            .set({
                "location": `/v1/users/${user._id}`
            })
            .json({
                message: "user created",
                data: {
                    name: user.name,
                    role: user.role,
                    username: user.username
                }
            });
    } catch (err) {
        next(err);
    }
}

const patchUsers = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            const error = new Error("invalid id");
            error.status = 400;
            throw error;
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                message: "user not found"
            });
        }
        Object.keys(req.body).forEach(key => user[key] = req.body[key]);
        const { password, __v, ...updated } = (await user.save()).toObject();
        return res.status(200).json({
            message: "user updated",
            data: updated
        });
    } catch (err) {
        next(err);
    }
}


const deleteUsers = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            const error = new Error("invalid id");
            error.status = 400;
            throw error;
        }
        await User.findByIdAndDelete(req.params.id);
        return res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export {
    getUsers,
    postUsers,
    patchUsers,
    deleteUsers,
    archiveUsers
};
