const User = require("../model/user");

const getUsers = async (req, res, next) => {
    const id = req.params.id;
    try {
        if (id) {
            // TODO - handle invalid ObjectId error
            const user = await User.findById(id)
                .select({
                    __v: 0,
                    password: 0
                })
                .lean();

            return res.status(200).json({
                data: user
            });
        }

        const filter = {};
        Object.keys(req.query).forEach(key => {
            if (key !== "page" && key !== "limit") {
                filter[key] = req.query[key];
            }
        });

        const page = Math.max(req.query.page, 1);
        const limit = +req.query.limit || 1000;
        const user = await User.find(filter)
            .select({
                __v: 0,
                password: 0
            })
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
            "link": `</v1/users?page=${page}&per_page=${limit}>;rel="self",</v1/users?page=${next_page}&per_page=${limit}>;rel="next",</v1/users?page=${prev_page}&per_page=${limit}>;rel="previous",</v1/users?page=0&per_page=${limit}>;rel="first",</v1/users?page=${total_pages}&per_page=${limit}>;rel="last",`
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
                    first: `/v1/users?page=0&per_page=${limit}`,
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
