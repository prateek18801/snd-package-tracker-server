import jwt from "jsonwebtoken";
import User from "../model/user.js";

const postLogin = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && !user.archived) {
            if (await user.match(password)) {
                const payload = {
                    sub: user._id,
                    role: user.role,
                    name: user.name,
                    username: user.username,
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
                return res.status(200).json({
                    token,
                    user: payload
                });
            }
        }
        return res.status(401).json({
            message: "invalid credentials"
        });
    } catch (err) {
        next(err);
    }
}

export {
    postLogin
};
