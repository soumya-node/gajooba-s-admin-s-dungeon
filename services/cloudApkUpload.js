import cloudinary  from "../config/cloudinary.js";

export const uploadApk = (file)=>{
    return new Promise((resolve, reject)=>{
        try{
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "games/apk",
                    resource_type: "raw",
                },
                (error, result)=>{
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            );

            stream.end(file.buffer);
        }catch(error){
            reject(error);
        }
    })
}