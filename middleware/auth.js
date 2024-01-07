import jwt from "jsonwebtoken";
import { isUnder } from "../utils/authorization.js";

const auth = (role) => {
    return (req, res, next) => {
        try {
            const token = req.headers?.authorization?.split(" ")[1];
            if (token) {
                const { iat, exp, ...user } = jwt.verify(token, process.env.JWT_SECRET);
                req.user = user;
                if (role && isUnder(user.role, role)) {
                    return res.status(403).json({
                        message: "forbidden"
                    });
                }
                return next();
            }
            return res.status(401).json({
                message: "unauthorized"
            });
        } catch (err) {
            return res.status(401).json({
                message: "unauthorized"
            });
        }
    }
}

export default auth;
