import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config.js";

export const uploadImage = (file, folder) => {
    try{
 return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
            },
            (err, result) => {

                if(err) return reject(err);

                resolve(result);

            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);

    });
    }catch(err){
        console.log(err)
    }
   
};