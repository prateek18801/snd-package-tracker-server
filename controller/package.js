import { isValidObjectId } from "mongoose";
import Package from "../model/package.js";
import Task from "../model/task.js";

const getPackages = async (req, res, next) => {
    // role >= executive
    try {
        if (req.params.id) {
            const pcg = await Package.findOne({ package_id: req.params.id }).lean();
            return res.status(200).json(pcg);
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
        const pcgs = await Package.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ created_at: -1 })
            .lean();

        const total_count = await Package.estimatedDocumentCount();
        const total_pages = Math.ceil(total_count / limit);
        const prev_page = Math.max(page - 1, 1);
        const next_page = Math.min(page + 1, total_pages);

        return res.status(200).set({
            "x-total-count": total_count,
            "link": `</v1/packages?page=${page}&per_page=${limit}>;rel="self",</v1/packages?page=${next_page}&per_page=${limit}>;rel="next",</v1/packages?page=${prev_page}&per_page=${limit}>;rel="previous",</v1/packages?page=1&per_page=${limit}>;rel="first",</v1/packages?page=${total_pages}&per_page=${limit}>;rel="last",`
        }).json({
            metadata: {
                page,
                limit,
                total_count,
                total_pages,
                links: {
                    self: `/v1/packages?page=${page}&per_page=${limit}`,
                    next: `/v1/packages?page=${next_page}&per_page=${limit}`,
                    prev: `/v1/packages?page=${prev_page}&per_page=${limit}`,
                    first: `/v1/packages?page=1&per_page=${limit}`,
                    last: `/v1/packages?page=${total_pages}&per_page=${limit}`
                }
            },
            data: pcgs
        });
    } catch (err) {
        next(err);
    }
}

const postPackages = async (req, res, next) => {
    // role >= executive
    try {
        if (!isValidObjectId(req.body.task_id)) {
            const error = new Error("invalid task id");
            error.status = 400;
            throw error;
        }
        const task = await Task.findById(req.body.task_id);
        if (!task) return res.status(404).json({
            message: "task not found"
        });
        if (!task.is_open) return res.status(400).json({
            message: "task closed"
        });

        const data = {
            package_id: req.body.package_id,
            courier: task.courier,
            channel: task.channel,
            type: task.type,
            cancelled: req.body.cancelled,
            executive: req.user.sub,
            task: task._id,
            remarks: req.body.remarks
        }

        // update remarks in case of re-scan
        const saved = await Package.findOne({ package_id: data.package_id });
        if (saved) {
            saved.remarks = req.body.remarks;
            await saved.save();
            return res.status(200).json({
                message: "package updated",
                data: saved
            });
        }

        const pcg = await new Package(data).save();
        // update packages list in task
        task.packages.push(pcg._id);
        await task.save();

        return res.status(201)
            .set({
                "location": `/v1/packages/${pcg._id}`
            })
            .json({
                message: "package created",
                data: pcg
            });
    } catch (err) {
        next(err);
    }
}

const patchPackages = async (req, res, next) => {
    // role >= executive
    const update = {
        package_id: req.body.package_id,
        cancelled: req.body.cancelled,
        remarks: req.body.remarks
    }
    try {
        if (!isValidObjectId(req.params.id)) {
            const error = new Error("invalid id");
            error.status = 400;
            throw error;
        }
        const updated = await Package.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
        if (updated) {
            return res.status(200).json({
                message: "package updated",
                data: updated
            });
        }
        return res.status(400).json({
            message: "package not found"
        });
    } catch (err) {
        next(err);
    }
}

const deletePackages = async (req, res, next) => {
    // role >= admin
    try {
        if (!isValidObjectId(req.params.id)) {
            const error = new Error("invalid id");
            error.status = 400;
            throw error;
        }
        const pcg = await Package.findByIdAndDelete(req.params.id);
        // find corresponding task remove package_id
        const task = await Task.findById(pcg.task);
        const packageIndex = task.packages.findIndex(package_id => package_id.toString() === pcg._id.toString());
        if (packageIndex !== -1) {
            task.packages.splice(packageIndex, 1);
            await task.save();
        }
        return res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export {
    getPackages,
    postPackages,
    patchPackages,
    deletePackages
};
