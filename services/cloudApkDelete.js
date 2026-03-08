import cloudinary from "../config/cloudinary.js";

export const deleteFile = async (public_id)=>{
    if(!public_id) return 
    try{
        await cloudinary.uploader.destroy(public_id, {
            resource_type: "raw",
        });
    }catch(error){
        console.log('file deletion error', error);
    }
}