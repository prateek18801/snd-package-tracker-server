import Task from "../model/task.js";

const getTasks = (req, res, next) => {

}

const postTasks = async (req, res, next) => {
    // role >= executive
    const data = {
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
            "location": `/v1/packages/${task._id}`
        }).json({
            message: "task created",
            data: task
        });
    } catch (err) {
        next(err);
    }
}

const patchTasks = (req, res, next) => {

}

const deleteTasks = (req, res, next) => {

}

export {
    getTasks,
    postTasks,
    patchTasks,
    deleteTasks
};
