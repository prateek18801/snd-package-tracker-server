import Package from "../model/package.js";
import Task from "../model/task.js";
import { isUnder, isOver } from "../utils/authorization.js";

const getPackages = async (req, res, next) => {
    // role >= executive
    const id = req.params.id;
    try {
        if (id) {
            // TODO - handle invalid ObjectId error
            const spackage = await Package.findById(id).select({ __v: 0 }).lean();
            return res.status(200).json({
                data: spackage
            });
        }

        const filter = {};
        Object.keys(req.query).forEach(key => {
            if (key !== "page" && key !== "limit") {
                filter[key] = req.query[key];
            }
        });

        const page = req.query.page ? Math.max(+req.query.page, 1) : 1;
        const limit = req.query.limit ? Math.max(+req.query.limit, 1) : 1000;
        const spackage = await Package.find(filter)
            .select({ __v: 0 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
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
            data: spackage
        });
    } catch (err) {
        next(err);
    }
}

const postPackages = async (req, res, next) => {
    // role >= executive
    try {
        const task = await Task.findById(req.body.task_id);
        if (!task) {
            return res.status(400).json({
                message: "task not found"
            });
        }
        if (task.status === "closed") {
            return res.status(400).json({
                message: "task closed"
            });
        }

        const data = {
            package_id: req.body.package_id,
            courier: task.courier,
            channel: task.channel,
            created_by: req.user.sub,
            updated_by: req.user.sub,
            outgoing: {
                // update timestamp only if role >= administrator
                timestamp: isOver(req.user.role, "executive") ? (req.body.timestamp || Date.now()) : Date.now(),
                executive: req.user.sub,
                task: task._id,
                remarks: req.body.remarks
            }
        }

        const spackage = await new Package(data).save();
        task.packages.push(spackage._id);
        await task.save();

        return res.status(201).set({
            "location": `/v1/packages/${spackage._id}`
        }).json({
            message: "package created",
            data: spackage
        });
    } catch (err) {
        next(err);
    }
}

const patchPackages = async (req, res, next) => {
    const id = req.params.id;
    const _return = req.query.return;
    let update = {};
    try {
        // if return ? role >= executive : role >= administrator
        if (_return === "true") {
            update = {
                updated_by: req.user.sub,
                return: true,
                incoming: {
                    timestamp: Date.now(),
                    executive: req.user.sub,
                    task: req.body.task_id,
                    remarks: req.body.remarks
                }
            }
        } else {
            if (isUnder(req.user.role, "administrator")) {
                return res.status(403).json({
                    message: "forbidden"
                });
            }
            update = {
                package_id: req.body.package_id,
                courier: req.body.courier,
                channel: req.body.channel,
                updated_by: req.user.sub,
                outgoing: {
                    timestamp: isOver(req.user.role, "executive") ? (req.body.timestamp || Date.now()) : Date.now(),
                    executive: req.user.sub,
                    task: req.body.task_id,
                    remarks: req.body.remarks
                }
            }
        }
        const upackage = await Package.findOneAndUpdate({ package_id: id }, update, { new: true })
            .select({ __v: 0 })
            .lean();
        if (upackage) {
            return res.status(200).json({
                message: "package updated",
                data: upackage
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
    // role >= administrator
    const id = req.params.id;
    try {
        // TODO - handle invalid ObjectId error
        await Package.findByIdAndDelete(id);
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
