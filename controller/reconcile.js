import { fileURLToPath } from "url";

const getTemplate = async (req, res, next) => {
    return res.status(200).download(fileURLToPath(new URL("../files/template.csv", import.meta.url)))
}

const postReconcile = async (req, res, next) => {

}

export {
    getTemplate,
    postReconcile
};
