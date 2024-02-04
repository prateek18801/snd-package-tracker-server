import Config from "../model/config.js";

const getConfig = async (req, res, next) => {
    const { title } = req.params;
    try {
        if (title) {
            const config = await Config.findOne({ title }).lean();
            return res.status(200).json({
                data: config.options
            });
        }
        const config = await Config.find({}).lean();
        const data = {};
        config.forEach(obj => {
            data[obj.title] = obj.options;
        });
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}

const postConfig = async (req, res, next) => {
    const { title } = req.params;
    const { options } = req.body;
    try {
        let config = await Config.findOne({ title });
        if (!config) {
            config = await new Config({ title, options }).save();
        } else {
            config.options = options;
            config = await config.save();
        }
        return res.status(200).json(config);
    } catch (err) {
        next(err);
    }
}

export {
    getConfig,
    postConfig
};
