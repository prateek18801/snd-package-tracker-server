import config from "./config.js";

const isEqual = (role, permission) => {
    return config.role.indexOf(role) === config.role.indexOf(permission);
}

const isOver = (role, permission) => {
    return config.role.indexOf(role) > config.role.indexOf(permission);
}

const isUnder = (role, permission) => {
    return config.role.indexOf(role) < config.role.indexOf(permission);
}

export {
    isEqual,
    isOver,
    isUnder
};
