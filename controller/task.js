import Task from "../model/task.js";
import Package from "../model/package.js";

const getTasks = async (req, res, next) => {
    // role >= executive
    const id = req.params.id;
    const { fields } = req.query;
    try {
        if (id) {
            // TODO - handle invalid ObjectId error
            const tasks = await Task.findById(id).select({ __v: 0 }).lean().populate("packages", fields?.replace(/,/g, " "));
            return res.status(200).json(tasks);
        }

        const filter = {};
        Object.keys(req.query).forEach(key => {
            if (key !== "page" && key !== "limit") {
                filter[key] = req.query[key];
            }
        });

        const page = req.query.page ? Math.max(+req.query.page, 1) : 1;
        const limit = req.query.limit ? Math.max(+req.query.limit, 1) : 1000;
        const tasks = await Task.find(filter)
            .select({ __v: 0 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
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
    const data = {
        // TODO - generate task_id
        task_id: req.body.task_id, 
        type: req.body.type,
        courier: req.body.courier,
        channel: req.body.channel,
        created_by: req.user.sub,
        updated_by: req.user.sub
    }
    try {
        const task = await new Task(data).save();
        return res.status(201).set({
            "location": `/v1/tasks/${task._id}`
        }).json({
            message: "task created",
            data: task
        });
    } catch (err) {
        next(err);
    }
}

const patchTasks = async (req, res, next) => {
    const id = req.params.id;
    const update = {
        type: req.body.type,
        status: req.body.status,
        courier: req.body.courier,
        channel: req.body.channel,
        updated_by: req.user.sub
    }
    try {
        const task = await Task.findByIdAndUpdate(id, update, { new: true })
            .select({ __v: 0 })
            .lean();
        if (task) {
            return res.status(200).json({
                message: "task updated",
                data: task
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
    // role >= administrator
    const id = req.params.id;
    try {
        // TODO - handle invalid ObjectId error
        // cascade delete for packages
        const task = await Task.findByIdAndDelete(id);
        await Package.deleteMany({ _id: { $in: task.packages } })
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
