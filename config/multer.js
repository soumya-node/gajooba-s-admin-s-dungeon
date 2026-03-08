import multer from "multer";

let storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {fileSize: 200 * 1024 * 1024} // 200MB
});

export {upload}