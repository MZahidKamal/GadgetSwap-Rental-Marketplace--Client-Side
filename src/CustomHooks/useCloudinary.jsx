import axios from "axios";


const UseCloudinary = () => {

    const uploadImageToCloudinaryAndGetURL = async (imageFile) => {

        if (!imageFile) {
            console.error("No image file provided");
            return null;
        }

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
        formData.append("cloud_name", import.meta.env.VITE_CLOUD_NAME);
        // formData.append("api_key", import.meta.env.VITE_API_KEY);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status !== 200) throw new Error("Failed to upload image");

            console.log(response);
            return response.data.secure_url;
        }
        catch (error) {
            console.error("Error uploading image:", error.message);
            return { error: error.message };
        }
    };

    return { uploadImageToCloudinaryAndGetURL };
};

export default UseCloudinary;
