import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (imageUrl) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const urlArray = imageUrl.split("/");
    const imgId = urlArray[urlArray.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  } catch (error) {
    throw new Error("Error while deleting profileImage from cloudinary");
  }
};

export { deleteFromCloudinary };
