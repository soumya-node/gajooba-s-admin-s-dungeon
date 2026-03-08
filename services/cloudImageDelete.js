import cloudinary from "../config/cloudinary.js";

export const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    throw err;
  }
};