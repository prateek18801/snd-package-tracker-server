import jwt from "jsonwebtoken";

const auth = () => {
    return (req, res, next) => {
        try {
            const token = req.headers?.authorization?.split(" ")[1];
            if (token) {
                const {iat, exp, ...user} = jwt.verify(token, process.env.JWT_SECRET);
                req.user = user;
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
