import {useContext, useEffect, useRef, useState} from "react"
import { FiBriefcase, FiHome, FiLock, FiMail, FiMapPin, FiPhone, FiRotateCw, FiSave, FiUpload, FiUser, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi"
import {useDispatch, useSelector} from "react-redux"
import AuthContext from "../../../Providers/AuthContext.jsx"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx"
import { getUserProfileDetails, updateUserProfileInfo } from "../../../Features/userProfileDetails/userProfileDetailsSlice.js"
import useCloudinary from "../../../CustomHooks/useCloudinary.jsx";
import {toast} from "react-toastify";


const UserSettingsComponent = () => {

    // State management
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser, updateExistingUsersPassword } = useContext(AuthContext)

    const dispatch = useDispatch()
    const { userProfileDetails } = useSelector((state) => state.userProfileDetails)
    const {uploadImageToCloudinaryAndGetURL} = useCloudinary();


    // Initial fake user data
    const initialUserData = {
        displayName: userProfileDetails?.displayName,
        email: userProfileDetails?.email,
        phone: userProfileDetails?.personalDetails?.phone,
        personalDetails: {
            bio: userProfileDetails?.personalDetails?.bio,
            profession: userProfileDetails?.personalDetails?.profession,
            photoURL: userProfileDetails?.personalDetails?.photoURL || "/placeholder.svg",
            phone: userProfileDetails?.personalDetails?.phone,
            billingAddress: {
                street: userProfileDetails?.personalDetails?.billingAddress?.street,
                city: userProfileDetails?.personalDetails?.billingAddress?.city,
                zipCode: userProfileDetails?.personalDetails?.billingAddress?.zipCode,
                state: userProfileDetails?.personalDetails?.billingAddress?.state,
                country: userProfileDetails?.personalDetails?.billingAddress?.country,
            },
        },
    }


    const axiosSecure = useAxiosSecure()
    const [formData, setFormData] = useState(initialUserData)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageSize, setImageSize] = useState({ width: 0, height: 0, size: 0 })
    const [zoom, setZoom] = useState(1)
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
    const [originalFile, setOriginalFile] = useState(null) // Store the original file


    // Fetch user profile detail on mount
    useEffect(() => {
        if (registeredUser?.email) {
            dispatch(getUserProfileDetails({ userEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser?.email])


    // Update formData when userProfileDetails changes
    useEffect(() => {
        if (userProfileDetails) {
            setFormData({
                displayName: userProfileDetails?.displayName,
                email: userProfileDetails?.email,
                phone: userProfileDetails?.personalDetails?.phone,
                personalDetails: {
                    bio: userProfileDetails?.personalDetails?.bio,
                    profession: userProfileDetails?.personalDetails?.profession,
                    photoURL: userProfileDetails?.personalDetails?.photoURL || "/placeholder.svg",
                    phone: userProfileDetails?.personalDetails?.phone,
                    billingAddress: {
                        street: userProfileDetails?.personalDetails?.billingAddress?.street,
                        city: userProfileDetails?.personalDetails?.billingAddress?.city,
                        zipCode: userProfileDetails?.personalDetails?.billingAddress?.zipCode,
                        state: userProfileDetails?.personalDetails?.billingAddress?.state,
                        country: userProfileDetails?.personalDetails?.billingAddress?.country,
                    },
                },
            })
        }
    }, [userProfileDetails])


    // Password states
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordError, setPasswordError] = useState("")
    const fileInputRef = useRef(null)
    const imageContainerRef = useRef(null)


    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Handle nested fields
        if (name.startsWith("billing.")) {
            const billingField = name.split(".")[1]
            setFormData({
                ...formData,
                personalDetails: {
                    ...formData.personalDetails,
                    billingAddress: {
                        ...formData.personalDetails?.billingAddress,
                        [billingField]: value,
                    },
                },
            })
        } else if (name === "profession" || name === "bio") {
            setFormData({
                ...formData,
                personalDetails: {
                    ...formData.personalDetails,
                    [name]: value,
                },
            })
        } else {
            setFormData({
                ...formData,
                [name]: value,
            })
        }
    }


    // Handle password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData({
            ...passwordData,
            [name]: value,
        })

        // Clear error when user types
        if (passwordError) {
            setPasswordError("")
        }
    }


    // Convert base64 to file
    const base64ToFile = (dataUrl, filename) => {
        if (!dataUrl || !originalFile) return null

        const arr = dataUrl.split(",")
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }

        return new File([u8arr], filename, { type: mime })
    }


    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // console.log(file)
        // const cloudinaryImageUrl = await uploadImageToCloudinaryAndGetURL(file);
        setOriginalFile(file) // Store the original file

        const reader = new FileReader()
        reader.onload = (event) => {
            setImagePreview(event.target.result)

            // Get image dimensions and size
            const img = new Image()
            img.onload = () => {
                setImageSize({
                    width: img.width,
                    height: img.height,
                    size: (file.size / 1024).toFixed(2), // Size in KB
                })
                setZoom(1)
                setPosition({ x: 0, y: 0 })
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Create updated user object in the required format
        const userInfoObj = {
            displayName: formData.displayName || "",
            email: formData.email || "",
            personalDetails: {
                bio: formData.personalDetails?.bio || "",
                profession: formData.personalDetails?.profession || "",
                photoURL: formData.personalDetails?.photoURL || "",
                phone: formData.phone || "",
                billingAddress: {
                    street: formData.personalDetails?.billingAddress?.street || "",
                    city: formData.personalDetails?.billingAddress?.city || "",
                    zipCode: formData.personalDetails?.billingAddress?.zipCode || "",
                    state: formData.personalDetails?.billingAddress?.state || "",
                    country: formData.personalDetails?.billingAddress?.country || "",
                },
            },
        }

        // If image has been modified, convert and log the modified image
        if (imagePreview && originalFile) {
            const modifiedFile = await base64ToFile(imagePreview, originalFile.name)
            const cloudinaryImageUrl = await uploadImageToCloudinaryAndGetURL(modifiedFile);

            if (cloudinaryImageUrl) userInfoObj.personalDetails.photoURL = cloudinaryImageUrl;
            else toast.error("Error uploading image!")
        }

        // Save the updated user object to database
        await dispatch(updateUserProfileInfo({userEmail: registeredUser?.email, userInfoObj, axiosSecure}))
        // console.log("Updated User Data:", userInfoObj)
    }


    // Handle password update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault()

        // Simple validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Invalid password data.")
            return
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long")
            return
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
            setPasswordError("Password must contain uppercase, lowercase, and number")
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match")
            return
        }

        await updateExistingUsersPassword(passwordData.currentPassword, passwordData.newPassword)

        // Reset form
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
    }


    // Handle zoom in/out
    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.1, 3))
    }


    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.1, 0.5))
    }


    // Handle image rotation
    const handleRotate = () => {
        if (!imageContainerRef.current || !imagePreview) return

        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            // Swap width and height for rotation
            canvas.width = img.height
            canvas.height = img.width

            // Rotate 90 degrees clockwise
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(Math.PI / 2)
            ctx.drawImage(img, -img.width / 2, -img.height / 2)

            // Update preview
            setImagePreview(canvas.toDataURL())
        }
        img.src = imagePreview
    }


    // Handle image dragging for repositioning
    const handleMouseDown = (e) => {
        if (!imagePreview) return
        setIsDragging(true)
        setStartPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        })
    }


    const handleMouseMove = (e) => {
        if (!isDragging) return
        setPosition({
            x: e.clientX - startPosition.x,
            y: e.clientY - startPosition.y,
        })
    }


    const handleMouseUp = () => {
        setIsDragging(false)
    }


    // Handle touch events for mobile
    const handleTouchStart = (e) => {
        if (!imagePreview) return
        setIsDragging(true)
        setStartPosition({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y,
        })
    }


    const handleTouchMove = (e) => {
        if (!isDragging) return
        setPosition({
            x: e.touches[0].clientX - startPosition.x,
            y: e.touches[0].clientY - startPosition.y,
        })
    }


    const handleTouchEnd = () => {
        setIsDragging(false)
    }


    // Remove image preview
    const removeImage = () => {
        setImagePreview(null)
        setImageSize({ width: 0, height: 0, size: 0 })
        setZoom(1)
        setPosition({ x: 0, y: 0 })
        setOriginalFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }


    // Add event listeners for mouse and touch events
    useEffect(() => {
        if (imageContainerRef.current) {
            const container = imageContainerRef.current

            container.addEventListener("mousedown", handleMouseDown)
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleMouseUp)

            container.addEventListener("touchstart", handleTouchStart)
            window.addEventListener("touchmove", handleTouchMove)
            window.addEventListener("touchend", handleTouchEnd)

            return () => {
                container.removeEventListener("mousedown", handleMouseDown)
                window.removeEventListener("mousemove", handleMouseMove)
                window.removeEventListener("mouseup", handleMouseUp)

                container.removeEventListener("touchstart", handleTouchStart)
                window.removeEventListener("touchmove", handleTouchMove)
                window.removeEventListener("touchend", handleTouchEnd)
            }
        }
    }, [isDragging, startPosition, imagePreview])


    useEffect(() => {
        window.scrollTo({
            top: 0,
            // behavior: 'smooth'
        })
    }, [])


    // Check if we have a profile image to display
    const hasProfileImage =
        imagePreview || (formData.personalDetails?.photoURL && formData.personalDetails.photoURL !== "/placeholder.svg")


    return (
        <div className={`w-full mx-auto rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
            {/* Main content */}
            <div className="space-y-5">
                {/* Profile Image Section */}
                <div
                    className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Profile Image</h2>

                        <div className="px-10 flex flex-col md:flex-row gap-4">
                            {/* Image preview container */}
                            <div
                                ref={imageContainerRef}
                                className={`relative w-40 h-40 rounded-full overflow-hidden mx-auto md:mx-0 border-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                                style={{ cursor: imagePreview ? "move" : "default" }}
                            >
                                {hasProfileImage ? (
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                        <img
                                            src={imagePreview || formData.personalDetails?.photoURL}
                                            alt="Profile preview"
                                            className="object-cover w-full h-full"
                                            style={
                                                imagePreview
                                                    ? {
                                                        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                                        transition: isDragging ? "none" : "transform 0.2s ease-out",
                                                    }
                                                    : {}
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={`w-full h-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                                    >
                                        <FiUser size={48} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Image upload controls */}
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <FiUpload size={16} className="text-blue-500" />
                                        <span>Upload Image</span>
                                    </button>

                                    {imagePreview && (
                                        <>
                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                onClick={handleZoomIn}
                                            >
                                                <FiZoomIn size={16} className="text-green-500" />
                                                <span>Zoom In</span>
                                            </button>

                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                onClick={handleZoomOut}
                                            >
                                                <FiZoomOut size={16} className="text-yellow-500" />
                                                <span>Zoom Out</span>
                                            </button>

                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                onClick={handleRotate}
                                            >
                                                <FiRotateCw size={16} className="text-purple-500" />
                                                <span>Rotate</span>
                                            </button>

                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                onClick={removeImage}
                                            >
                                                <FiX size={16} className="text-red-500" />
                                                <span>Remove</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />

                                {imagePreview && (
                                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        <p>
                                            Dimensions: {imageSize.width} x {imageSize.height}px
                                        </p>
                                        <p>File size: {imageSize.size} KB</p>
                                        <p className="mt-2 text-xs">Drag to reposition image. Use zoom buttons to adjust size.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Section */}
                <form
                    onSubmit={handleSubmit}
                    className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Full Name
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiUser size={18}/>
                                    </span>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Email Address
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiMail size={18}/>
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Phone Number
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiPhone size={18} />
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiSave size={18} />
                                Save Profile
                            </button>
                        </div>
                    </div>
                </form>

                {/* Password Section */}
                <form
                    onSubmit={handlePasswordUpdate}
                    className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Update Password</h2>

                        <div className="space-y-4">
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Current Password
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiLock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    New Password
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiLock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Confirm New Password
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiLock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                        required
                                    />
                                </div>
                            </div>

                            {passwordError && <div className="text-red-500 text-sm mt-2">{passwordError}</div>}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
                                >
                                    <FiSave size={18} />
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Professional Information Section */}
                <form
                    onSubmit={handleSubmit}
                    className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Professional Information</h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Profession
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiBriefcase size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="profession"
                                        value={formData.personalDetails?.profession || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.personalDetails?.bio || ""}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className={`block w-full px-4 py-3 rounded-lg border focus:outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                ></textarea>
                                <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Brief description about yourself that will be visible on your profile.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiSave size={18} />
                                Save Professional Info
                            </button>
                        </div>
                    </div>
                </form>

                {/* Billing Address Section */}
                <form
                    onSubmit={handleSubmit}
                    className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Street Address
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiHome size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="billing.street"
                                        value={formData.personalDetails?.billingAddress?.street || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    City
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiMapPin size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="billing.city"
                                        value={formData.personalDetails?.billingAddress?.city || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    State/Province
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiMapPin size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="billing.state"
                                        value={formData.personalDetails?.billingAddress?.state || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    ZIP/Postal Code
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiMapPin size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="billing.zipCode"
                                        value={formData.personalDetails?.billingAddress?.zipCode || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Country
                                </label>
                                <div
                                    className={`flex items-center rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                                >
                                    <span className="px-3 py-2 text-gray-500">
                                        <FiMapPin size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="billing.country"
                                        value={formData.personalDetails?.billingAddress?.country || ""}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 rounded-r-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiSave size={18} />
                                Save Billing Address
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UserSettingsComponent;
