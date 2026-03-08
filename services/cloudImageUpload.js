import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "games" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      stream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });
};