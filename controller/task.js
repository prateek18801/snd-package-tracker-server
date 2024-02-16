import { isValidObjectId } from "mongoose";
import Task from "../model/task.js";
import Package from "../model/package.js";

const getTasks = async (req, res, next) => {
    // role >= executive
    try {
        if (req.params.id) {
            if (!isValidObjectId(req.params.id)) {
                const error = new Error("invalid id");
                error.status = 400;
                throw error;
            }
            const task = await Task.findById(req.params.id)
                // .populate("packages", req.query?.fields?.replace(/,/g, " "))
                .populate({
                    path: "packages",
                    populate: { path: "executive", select: "name username" }
                })
                .populate("created_by", "name username")
                .lean();
            return res.status(200).json(task);
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
        const tasks = await Task.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ created_at: -1 })
            .lean();

        const total_count = await Task.estimatedDocumentCount();
        const total_pages = Math.ceil(total_count / limit);
        const prev_page = Math.max(page - 1, 1);
        const next_page = Math.min(page + 1, total_pages);

        return res.status(200).set({
            "x-total-count": total_count,
            "link": `</v1/tasks?page=${page}&per_page=${limit}>;rel="self",</v1/tasks?page=${next_page}&per_page=${limit}>;rel="next",</v1/tasks?page=${prev_page}&per_page=${limit}>;rel="previous",</v1/tasks?page=1&per_page=${limit}>;rel="first",</v1/tasks?page=${total_pages}&per_page=${limit}>;rel="last",`
        }).json({
            metadata: {
                page,
                limit,
                total_count,
                total_pages,
                links: {
                    self: `/v1/tasks?page=${page}&per_page=${limit}`,
                    next: `/v1/tasks?page=${next_page}&per_page=${limit}`,
                    prev: `/v1/tasks?page=${prev_page}&per_page=${limit}`,
                    first: `/v1/tasks?page=1&per_page=${limit}`,
                    last: `/v1/tasks?page=${total_pages}&per_page=${limit}`
                }
            },
            data: tasks
        });
    } catch (err) {
        next(err);
    }
}

const postTasks = async (req, res, next) => {
    // role >= executive
    try {
        const { task_id, ..._ } = (await Task.findOne({}).sort({ "created_at": -1 })) || { task_id: 0 };
        const data = {
            // TODO - generate task_id
            task_id: ("000" + (+task_id + 1)).slice(-4),
            type: req.body.type,
            is_open: req.body.is_open,
            courier: req.body.courier,
            channel: req.body.channel,
            vehicle_no: req.body.vehicle_no?.toUpperCase() ?? undefined,
            delex_name: req.body.delex_name,
            delex_contact: req.body.delex_contact,
            created_by: req.user.sub,
            updated_by: req.user.sub
        }
        const task = await new Task(data).save();
        return res.status(201)
            .set({
                "location": `/v1/tasks/${task._id}`
            })
            .json({
                message: "task created",
                data: task
            });
    } catch (err) {
        next(err);
    }
}

const patchTasks = async (req, res, next) => {
    // role >= admin
    const update = {
        type: req.body.type,
        is_open: req.body.is_open,
        courier: req.body.courier,
        channel: req.body.channel,
        vehicle_no: req.body.vehicle_no?.toUpperCase() ?? undefined,
        delex_name: req.body.delex_name,
        delex_contact: req.body.delex_contact,
        updated_by: req.user.sub
    }
    try {
        if (!isValidObjectId(req.params.id)) {
            const error = new Error("invalid id");
            error.status = 400;
            throw error;
        }
        const updated = await Task.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
        if (updated) {
            return res.status(200).json({
                message: "task updated",
                data: updated
            });
        }
        return res.status(400).json({
            message: "task not found"
        });
    } catch (err) {
        next(err);
    }
}

const deleteTasks = async (req, res, next) => {
    // role >= admin
    try {
        if (!isValidObjectId(req.params.id)) {
            const error = new Error("invalid id");
            error.status = 400;
            throw error;
        }
        const task = await Task.findByIdAndDelete(req.params.id);
        // cascade delete all pacakges
        await Package.deleteMany({ _id: { $in: task.packages } });
        return res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export {
    getTasks,
    postTasks,
    patchTasks,
    deleteTasks
};
