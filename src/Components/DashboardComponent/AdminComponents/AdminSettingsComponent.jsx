import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FiUser, FiLock, FiBriefcase, FiUpload, FiEye, FiEyeOff, FiSave, FiAlertTriangle, FiCheck, FiMapPin } from "react-icons/fi"
import { FaCrown, FaCheckCircle } from "react-icons/fa"
import AuthContext from "../../../Providers/AuthContext.jsx"
import {getUserProfileDetails, updateUserProfileInfo} from "../../../Features/userProfileDetails/userProfileDetailsSlice.js"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx"
import useCloudinary from "../../../CustomHooks/useCloudinary.jsx"


const AdminSettingsComponent = () => {

    // Dark mode from Redux
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser, updateExistingUsersPassword } = useContext(AuthContext)
    const dispatch = useDispatch()
    const { userProfileDetails } = useSelector((state) => state.userProfileDetails)
    const axiosSecure = useAxiosSecure()
    const { uploadImageToCloudinaryAndGetURL } = useCloudinary()

    // State for image preview and original file
    const [imagePreview, setImagePreview] = useState(null)
    const [originalFile, setOriginalFile] = useState(null)

    // Form data state
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        personalDetails: {
            bio: "",
            profession: "",
            photoURL: "",
            phone: "",
            billingAddress: {
                street: "",
                city: "",
                zipCode: "",
                state: "",
                country: "",
            },
            verified: true,
        },
    })

    // Password states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Active tab state
    const [activeTab, setActiveTab] = useState("profile")

    // Success and error messages
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")


    // Convert base64 to file
    const base64ToFile = async (base64String, fileName) => {
        const res = await fetch(base64String)
        const blob = await res.blob()
        return new File([blob], fileName, { type: blob.type })
    }


    useEffect(() => {
        if (registeredUser?.email) {
            dispatch(getUserProfileDetails({ userEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser?.email])


    // Update form data when userProfileDetails changes
    useEffect(() => {
        if (userProfileDetails) {
            setFormData({
                displayName: userProfileDetails.displayName || "",
                email: userProfileDetails.email || "",
                personalDetails: {
                    bio: userProfileDetails.personalDetails?.bio || "",
                    profession: userProfileDetails.personalDetails?.profession || "",
                    photoURL: userProfileDetails.personalDetails?.photoURL || "",
                    phone: userProfileDetails.personalDetails?.phone || "",
                    billingAddress: {
                        street: userProfileDetails.personalDetails?.billingAddress?.street || "",
                        city: userProfileDetails.personalDetails?.billingAddress?.city || "",
                        zipCode: userProfileDetails.personalDetails?.billingAddress?.zipCode || "",
                        state: userProfileDetails.personalDetails?.billingAddress?.state || "",
                        country: userProfileDetails.personalDetails?.billingAddress?.country || "",
                    },
                    verified: userProfileDetails.personalDetails?.verified || true,
                },
            })
        }
    }, [userProfileDetails])


    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target

        if (name.includes("billingAddress")) {
            const field = name.split(".").pop()
            setFormData((prev) => ({
                ...prev,
                personalDetails: {
                    ...prev.personalDetails,
                    billingAddress: {
                        ...prev.personalDetails?.billingAddress,
                        [field]: value,
                    },
                },
            }))
        } else if (name.startsWith("personalDetails.")) {
            const field = name.replace("personalDetails.", "")
            setFormData((prev) => ({
                ...prev,
                personalDetails: {
                    ...prev.personalDetails,
                    [field]: value,
                },
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
    }


    // Handle image change
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setOriginalFile(file)

            const reader = new FileReader()
            reader.onload = (event) => {
                setImagePreview(event.target.result)
            }
            reader.readAsDataURL(file)
        }
    }


    // Combined function to handle all admin profile updates
    const handleAdminProfileUpdate = async (e) => {
        e.preventDefault()

        // Create an updated user object in the required format
        const userInfoObj = {
            displayName: formData.displayName || "",
            email: formData.email || "",
            personalDetails: {
                bio: formData.personalDetails?.bio || "",
                profession: formData.personalDetails?.profession || "",
                photoURL: formData.personalDetails?.photoURL || "",
                phone: formData.personalDetails?.phone || "",
                billingAddress: {
                    street: formData.personalDetails?.billingAddress?.street || "",
                    city: formData.personalDetails?.billingAddress?.city || "",
                    zipCode: formData.personalDetails?.billingAddress?.zipCode || "",
                    state: formData.personalDetails?.billingAddress?.state || "",
                    country: formData.personalDetails?.billingAddress?.country || "",
                },
                verified: formData.personalDetails?.verified,
            },
        }

        // If an image has been modified, convert and log the modified image
        if (imagePreview && originalFile) {
            const modifiedFile = await base64ToFile(imagePreview, originalFile.name)
            const cloudinaryImageUrl = await uploadImageToCloudinaryAndGetURL(modifiedFile)

            if (cloudinaryImageUrl) userInfoObj.personalDetails.photoURL = cloudinaryImageUrl
            else console.error("Error uploading image!")
        }

        // Save the updated user object to the database
        await dispatch(updateUserProfileInfo({ userEmail: registeredUser?.email, userInfoObj, axiosSecure }))
        setSuccessMessage("Profile information updated successfully!")
        setTimeout(() => setSuccessMessage(""), 2000)
    }


    // Handle password update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault()

        if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
            setErrorMessage("Please fill in all fields!")
            setTimeout(() => setErrorMessage(""), 1200)
            return
        }
        if (newPassword.length < 8) {
            setErrorMessage("New password must be at least 8 characters long!")
            setTimeout(() => setErrorMessage(""), 1200)
            return
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            setErrorMessage("New password must contain at least one uppercase letter, one lowercase letter and one number!")
            setTimeout(() => setErrorMessage(""), 1200)
            return
        }
        if (newPassword === currentPassword) {
            setErrorMessage("New password cannot be the same as the current password!")
            setTimeout(() => setErrorMessage(""), 1200)
            return
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage("New passwords do not match!")
            setTimeout(() => setErrorMessage(""), 1200)
            return
        }

        // Update password in the Firebase
        await updateExistingUsersPassword(currentPassword, newPassword)

        setSuccessMessage("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSuccessMessage(""), 2000)
    }


    // Tab button class generator
    const getTabClass = (tabName) => {
        return `px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === tabName
                ? darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-800"
                : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
        }`
    }


    // Input field class generator
    const getInputClass = () => {
        return `w-full px-4 py-2 rounded-lg border ${
            darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500"
                : "bg-white border-gray-300 text-gray-800 focus:border-purple-500"
        } focus:outline-none transition-colors`
    }


    // Button class generator
    const getButtonClass = (isPrimary = true) => {
        return `px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            isPrimary
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        }`
    }


    return (
        <div
            className={`border-1  w-full mx-auto rounded-xl transition-colors ${darkMode ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-white text-gray-800"}`}
        >
            {/* Tabs */}
            <div className="p-6 pb-0 flex flex-wrap gap-2 relative">

                <div className="absolute top-7 right-7">
                    {userProfileDetails?.personalDetails?.verified ? (
                        <div className="flex items-center bg-green-100 text-green-800 px-5 py-1 rounded-full text-sm font-medium">
                            <FaCheckCircle className="mr-1" />
                            Verified
                        </div>
                    ) : (
                        <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            <FiAlertTriangle className="mr-1" />
                            Unverified
                        </div>
                    )}
                </div>

                <button onClick={() => setActiveTab("profile")} className={getTabClass("profile")}>
                    <div className="flex items-center">
                        <FiUser className="mr-2" />
                        <span>Profile</span>
                    </div>
                </button>
                <button onClick={() => setActiveTab("professional")} className={getTabClass("professional")}>
                    <div className="flex items-center">
                        <FiBriefcase className="mr-2" />
                        <span>Professional</span>
                    </div>
                </button>
                <button onClick={() => setActiveTab("address")} className={getTabClass("address")}>
                    <div className="flex items-center">
                        <FiMapPin className="mr-2" />
                        <span>Office Address</span>
                    </div>
                </button>
                <button onClick={() => setActiveTab("membership")} className={getTabClass("membership")}>
                    <div className="flex items-center">
                        <FaCrown className="mr-2 text-yellow-500" />
                        <span>Membership</span>
                    </div>
                </button>
                <button onClick={() => setActiveTab("security")} className={getTabClass("security")}>
                    <div className="flex items-center">
                        <FiLock className="mr-2" />
                        <span>Account Security</span>
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 ">
                {/* Profile Information */}
                {activeTab === "profile" && (
                    <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <FiUser className="mr-2" />
                            Profile Information
                        </h2>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Profile Image */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <img
                                        src={imagePreview || userProfileDetails?.personalDetails?.photoURL || "/placeholder.svg"}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                                        <FiUpload className="text-white" />
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>
                                <p className="mt-2 font-medium">{userProfileDetails?.role}</p>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Joined:{" "}
                                    {userProfileDetails?.joinDate ? new Date(userProfileDetails.joinDate).toLocaleDateString() : "N/A"}
                                </p>
                            </div>

                            {/* Profile Form */}
                            <div className="flex-1">
                                <form onSubmit={handleAdminProfileUpdate}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Full Name</label>
                                            <input
                                                type="text"
                                                name="displayName"
                                                value={formData.displayName || ""}
                                                onChange={handleInputChange}
                                                className={getInputClass()}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ""}
                                                className={getInputClass()}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Phone</label>
                                            <input
                                                type="tel"
                                                name="personalDetails.phone"
                                                value={formData.personalDetails?.phone || ""}
                                                onChange={handleInputChange}
                                                className={getInputClass()}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button type="submit" className={getButtonClass()}>
                                            <div className="flex items-center">
                                                <FiSave className="mr-2" />
                                                Save Changes
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Professional Information */}
                {activeTab === "professional" && (
                    <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <FiBriefcase className="mr-2" />
                            Professional Information
                        </h2>

                        <form onSubmit={handleAdminProfileUpdate}>
                            <div className="space-y-4 max-w-2xl">
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Profession</label>
                                    <input
                                        type="text"
                                        name="personalDetails.profession"
                                        value={formData.personalDetails?.profession || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Bio</label>
                                    <textarea
                                        name="personalDetails.bio"
                                        rows="4"
                                        value={formData.personalDetails?.bio || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                        placeholder="Write a short bio about your role and responsibilities"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="submit" className={getButtonClass()}>
                                    <div className="flex items-center">
                                        <FiSave className="mr-2" />
                                        Save Professional Info
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Office Address */}
                {activeTab === "address" && (
                    <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <FiMapPin className="mr-2" />
                            Office Address
                        </h2>

                        <form onSubmit={handleAdminProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                <div className="md:col-span-2">
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Street Address</label>
                                    <input
                                        type="text"
                                        name="personalDetails.billingAddress.street"
                                        value={formData.personalDetails?.billingAddress?.street || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>City</label>
                                    <input
                                        type="text"
                                        name="personalDetails.billingAddress.city"
                                        value={formData.personalDetails?.billingAddress?.city || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>ZIP Code</label>
                                    <input
                                        type="text"
                                        name="personalDetails.billingAddress.zipCode"
                                        value={formData.personalDetails?.billingAddress?.zipCode || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>State/Province</label>
                                    <input
                                        type="text"
                                        name="personalDetails.billingAddress.state"
                                        value={formData.personalDetails?.billingAddress?.state || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Country</label>
                                    <input
                                        type="text"
                                        name="personalDetails.billingAddress.country"
                                        value={formData.personalDetails?.billingAddress?.country || ""}
                                        onChange={handleInputChange}
                                        className={getInputClass()}
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="submit" className={getButtonClass()}>
                                    <div className="flex items-center">
                                        <FiSave className="mr-2" />
                                        Save Address
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Membership */}
                {activeTab === "membership" && (
                    <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <FaCrown className="mr-2 text-yellow-500" />
                            Admin Membership
                        </h2>

                        <div className={`p-6 rounded-xl border-2 border-yellow-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center">
                                        <FaCrown className="mr-2 text-yellow-500" />
                                        {userProfileDetails?.membershipDetails?.membershipTier || "Platinum"} Membership
                                    </h3>
                                    <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Lifetime access to all admin features
                                    </p>
                                </div>
                                <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-bold">ACTIVE</div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                    <h4 className="font-semibold">Admin Privileges</h4>
                                    <ul className="mt-2 space-y-2">
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            Full platform management
                                        </li>
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            User account management
                                        </li>
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            Gadget inventory control
                                        </li>
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            Order processing and management
                                        </li>
                                    </ul>
                                </div>
                                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                    <h4 className="font-semibold">Advanced Features</h4>
                                    <ul className="mt-2 space-y-2">
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            Analytics dashboard access
                                        </li>
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            Financial reporting
                                        </li>
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            System configuration
                                        </li>
                                        <li className="flex items-center">
                                            <FiCheck className="mr-2 text-green-500" />
                                            API access management
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-lg bg-purple-100 text-purple-800">
                                <p className="font-medium">
                                    As an admin, your {userProfileDetails?.membershipDetails?.membershipTier || "Platinum"} membership is
                                    complimentary and does not require payment.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Password */}
                {activeTab === "security" && (
                    <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <FiLock className="mr-2" />
                            Update Password
                        </h2>

                        <form onSubmit={handlePasswordUpdate}>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className={getInputClass()}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <FiEyeOff className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                            ) : (
                                                <FiEye className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={getInputClass()}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <FiEyeOff className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                            ) : (
                                                <FiEye className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={getInputClass()}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <FiEyeOff className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                            ) : (
                                                <FiEye className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="submit" className={getButtonClass()}>
                                    <div className="flex items-center">
                                        <FiSave className="mr-2" />
                                        Update Password
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Success and Error Messages */}
            {successMessage && (
                <div className="mx-6 mb-6 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
                    <FiCheck className="mr-2" />
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mx-6 mb-6 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
                    <FiAlertTriangle className="mr-2" />
                    {errorMessage}
                </div>
            )}
        </div>
    )
}

export default AdminSettingsComponent;
