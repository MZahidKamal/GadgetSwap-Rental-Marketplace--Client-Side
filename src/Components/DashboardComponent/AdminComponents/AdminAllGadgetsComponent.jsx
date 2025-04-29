import { useState, useEffect, useRef, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar, FiImage, FiUpload, FiX, FiCheck, FiChevronDown, FiPackage, FiDollarSign, FiCalendar, FiAlertCircle, FiGrid, FiList, FiArrowLeft, FiMessageSquare, FiUser } from "react-icons/fi"
import { FaLaptop, FaMobileAlt, FaTabletAlt, FaHeadphones, FaCamera, FaGamepad, FaVrCardboard, FaWifi, FaClock, FaVolumeUp, FaPlane, FaProjectDiagram } from "react-icons/fa"
import AuthContext from "../../../Providers/AuthContext.jsx"
import { getAllGadgetsFullDetailsForAdmin, updateTheDetailsOfAGadgetByAdmin, addANewGadgetWithDetailsByAdmin } from "../../../Features/adminAllGadgets/adminAllGadgetsSlice.js"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx"
import useCloudinary from "../../../CustomHooks/useCloudinary.jsx"


const AdminAllGadgetsComponent = () => {

    // States
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser } = useContext(AuthContext)
    const dispatch = useDispatch()
    const { allGadgetsFullDetails } = useSelector((state) => state.adminAllGadgets)

    const axiosSecure = useAxiosSecure()
    const [gadgets, setGadgets] = useState([])
    const [selectedGadget, setSelectedGadget] = useState(null)
    const [isAddingGadget, setIsAddingGadget] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [availabilityFilter, setAvailabilityFilter] = useState("all")
    const [viewMode, setViewMode] = useState("list") // Changed default to list
    const [editMode, setEditMode] = useState(false)
    const [editedGadget, setEditedGadget] = useState(null)
    const [selectedTab, setSelectedTab] = useState("details")
    const [isMobileView, setIsMobileView] = useState(false)
    const [showGadgetList, setShowGadgetList] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [gadgetToDelete, setGadgetToDelete] = useState(null)
    const [reviewToDelete, setReviewToDelete] = useState(null)
    const [showReviewDeleteConfirm, setShowReviewDeleteConfirm] = useState(false)
    const [uploadedImages, setUploadedImages] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
    const [newGadget, setNewGadget] = useState(null)
    const { uploadImageToCloudinaryAndGetURL } = useCloudinary()

    const fileInputRef = useRef(null)


    useEffect(() => {
        if (registeredUser) {
            dispatch(getAllGadgetsFullDetailsForAdmin({ adminEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser])


    // Initialize gadgets with allGadgetsFullDetails when it's available
    useEffect(() => {
        if (allGadgetsFullDetails?.length > 0) {
            setGadgets(allGadgetsFullDetails)
        }
    }, [allGadgetsFullDetails])


    // Empty gadget template
    const emptyGadget = {
        // id: "",
        name: "",
        category: "",
        brand: "",
        model: "",
        description: "",
        specifications: {},
        included: [""],
        images: [],
        pricing: {
            perDay: 0,
            deposit: 0,
            basicInsuranceFee: 0,
            premiumInsuranceFee: 0,
        },
        availability: {
            total_copy: 0,
            status: true,
            blockedDates: [],
        },
        ratings: [],
        average_rating: 0,
        reviews: [],
        totalRentalCount: 0,
    }


    // Initialize data
    useEffect(() => {
        // Check if mobile view
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1024)
        }

        handleResize()
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])


    // Categories with their icons
    const categories = [
        { name: "All", icon: <FiGrid className="mr-2" /> },
        { name: "Smartphones", icon: <FaMobileAlt className="text-blue-500" /> },
        { name: "Laptops", icon: <FaLaptop className="text-purple-500" /> },
        { name: "Tablets", icon: <FaTabletAlt className="text-green-500" /> },
        { name: "Smartwatches", icon: <FaClock className="text-pink-500" /> },
        { name: "Cameras", icon: <FaCamera className="text-red-500" /> },
        { name: "Gaming", icon: <FaGamepad className="text-indigo-500" /> },
        { name: "Audio", icon: <FaVolumeUp className="text-yellow-500" /> },
        { name: "Headphones", icon: <FaHeadphones className="text-cyan-500" /> },
        { name: "Speakers", icon: <FaVolumeUp className="text-blue-500" /> },
        { name: "Wearables", icon: <FaWifi className="text-lime-500" /> },
        { name: "VR", icon: <FaVrCardboard className="text-orange-500" /> },
        { name: "Drones", icon: <FaPlane className="text-teal-500" /> },
        { name: "Projectors", icon: <FaProjectDiagram className="text-amber-500" /> },
    ]


    // Get category icon
    const getCategoryIcon = (category) => {
        const foundCategory = categories.find((cat) => cat.name === category)
        if (foundCategory) {
            return foundCategory.icon
        }
        return <FiPackage className="text-gray-500" />
    }

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(amount)
    }


    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    }


    // Calculate total reviews
    const getTotalReviews = () => {
        return gadgets.reduce((sum, gadget) => sum + (gadget?.reviews?.length || 0), 0)
    }


    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }


    // Handle category filter
    const handleCategoryFilter = (category) => {
        setCategoryFilter(category)
    }


    // Handle availability filter
    const handleAvailabilityFilter = (availability) => {
        setAvailabilityFilter(availability)
    }


    // Handle view mode toggle
    const handleViewModeToggle = (mode) => {
        setViewMode(mode)
    }


    // Handle gadget selection
    const handleSelectGadget = (gadget) => {
        setSelectedGadget(gadget)
        setEditedGadget(JSON.parse(JSON.stringify(gadget))) // Deep copy
        setEditMode(false)
        setSelectedTab("details")

        // On mobile, hide the gadget list when a gadget is selected
        if (isMobileView) {
            setShowGadgetList(false)
        }
    }


    // Handle back to a gadget list (mobile only)
    const handleBackToGadgetList = () => {
        setShowGadgetList(true)
        setSelectedGadget(null)
        setIsAddingGadget(false)
    }


    // Handle adds new gadget
    const handleAddNewGadget = () => {
        setIsAddingGadget(true)
        setSelectedGadget(null)
        setNewGadget(JSON.parse(JSON.stringify(emptyGadget))) // Deep copy of an empty template
        setEditMode(true)
        setSelectedTab("details")

        // On mobile, hide the gadget list when adding a new gadget
        if (isMobileView) {
            setShowGadgetList(false)
        }
    }


    // Handle edit gadget
    const handleEditGadget = () => {
        setEditMode(true)
    }


    // Handle cancel edit
    const handleCancelEdit = () => {
        if (isAddingGadget) {
            setIsAddingGadget(false)
            setNewGadget(null)
            setSelectedGadget(null)

            // On mobile, show the gadget list when canceling adding
            if (isMobileView) {
                setShowGadgetList(true)
            }
        } else {
            setEditMode(false)
            setEditedGadget(JSON.parse(JSON.stringify(selectedGadget))) // Reset to original
        }
    }


    // Handle adding a new gadget directly into the database
    const handleAddGadget = async () => {
        await dispatch(addANewGadgetWithDetailsByAdmin({adminEmail: registeredUser?.email, newGadgetDetailsObject: newGadget, axiosSecure}))
        // console.log("New gadget to be added:", newGadget)

        // Reset UI state
        setIsAddingGadget(false)
        setEditMode(false)
        setNewGadget(null)

        // On mobile, show the gadget list after adding
        if (isMobileView) {
            setShowGadgetList(true)
        }
    }


    // Handle saving an edited gadget directly into the database
    const handleSaveEditedGadget = async () => {
        // console.log("Gadget to be updated:", editedGadget)
        await dispatch(
            updateTheDetailsOfAGadgetByAdmin({
                adminEmail: registeredUser?.email,
                updatedGadgetObject: editedGadget,
                axiosSecure,
            }),
        )

        // Reset UI state
        setEditMode(false)

        // On mobile, show the gadget list after editing
        if (isMobileView && !selectedGadget) {
            setShowGadgetList(true)
        }
    }


    // Handle save gadget - now just routes to the appropriate function
    const handleSaveGadget = async () => {
        if (isAddingGadget) {
            await handleAddGadget()
        } else {
            await handleSaveEditedGadget()
        }
    }


    // Handle delete gadget confirmation
    const handleDeleteConfirm = (gadget) => {
        setGadgetToDelete(gadget)
        setShowDeleteConfirm(true)
    }


    // Handle delete gadget
    const handleDeleteGadget = () => {
        if (!gadgetToDelete) return

        const updatedGadgets = gadgets.filter((g) => g.id !== gadgetToDelete.id)
        setGadgets(updatedGadgets)
        setSelectedGadget(null)
        setShowDeleteConfirm(false)
        setGadgetToDelete(null)

        // On mobile, show a gadget list after delete
        if (isMobileView) {
            setShowGadgetList(true)
        }
    }


    // Handle cancel delete
    const handleCancelDelete = () => {
        setShowDeleteConfirm(false)
        setGadgetToDelete(null)
    }


    // Handle tab change
    const handleTabChange = (tab) => {
        setSelectedTab(tab)
    }


    // Handle input change for an edited gadget
    const handleInputChange = (field, value) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        if (field.includes(".")) {
            const [parent, child] = field.split(".")
            setStateFunction({
                ...stateToUpdate,
                [parent]: {
                    ...stateToUpdate[parent],
                    [child]: value,
                },
            })
        } else {
            setStateFunction({
                ...stateToUpdate,
                [field]: value,
            })
        }
    }


    // Handle included item change
    const handleIncludedChange = (index, value) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        const newIncluded = [...stateToUpdate.included]
        newIncluded[index] = value
        setStateFunction({
            ...stateToUpdate,
            included: newIncluded,
        })
    }


    // Handle add included item
    const handleAddIncludedItem = () => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        setStateFunction({
            ...stateToUpdate,
            included: [...stateToUpdate.included, ""],
        })
    }


    // Handle remove included item
    const handleRemoveIncludedItem = (index) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        const newIncluded = [...stateToUpdate.included]
        newIncluded.splice(index, 1)
        setStateFunction({
            ...stateToUpdate,
            included: newIncluded,
        })
    }


    // Handle adds a specification field
    const handleAddSpecification = () => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        const newKey = `spec_${Object.keys(stateToUpdate.specifications).length + 1}`
        setStateFunction({
            ...stateToUpdate,
            specifications: {
                ...stateToUpdate.specifications,
                [newKey]: "",
            },
        })
    }


    // Handle remove specification field
    const handleRemoveSpecification = (key) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        const newSpecifications = { ...stateToUpdate.specifications }
        delete newSpecifications[key]
        setStateFunction({
            ...stateToUpdate,
            specifications: newSpecifications,
        })
    }


    // Handle specification key change
    const handleSpecificationKeyChange = (oldKey, newKey) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        // Don't proceed if the new key is empty
        if (!newKey.trim()) return

        // Create a temporary copy of specifications
        const newSpecifications = {}

        // Copy all specifications except the one being edited
        Object.entries(stateToUpdate.specifications).forEach(([key, value]) => {
            if (key === oldKey) {
                // For the key being edited, use the new key name but keep the same value
                newSpecifications[newKey] = stateToUpdate.specifications[oldKey]
            } else {
                newSpecifications[key] = value
            }
        })

        // Update the specifications with the new structure
        setStateFunction({
            ...stateToUpdate,
            specifications: newSpecifications,
        })
    }


    // Handle specification value change
    const handleSpecificationValueChange = (key, value) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        setStateFunction({
            ...stateToUpdate,
            specifications: {
                ...stateToUpdate.specifications,
                [key]: value,
            },
        })
    }


    // Handle image upload
    const handleImageUpload = () => {
        fileInputRef.current?.click()
    }


    // Handle file selection
    const handleFileSelected = async (e) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        const files = Array.from(e.target.files)
        if (!files.length) return

        setIsUploading(true)

        try {
            // Get current images
            const currentImages = [...stateToUpdate.images]

            // Upload each file to Cloudinary (up to 5 total images)
            const uploadPromises = files.slice(0, 5 - currentImages.length).map(async (file) => {
                const cloudinaryImageUrl = await uploadImageToCloudinaryAndGetURL(file)
                return cloudinaryImageUrl
            })

            // Wait for all uploads to complete
            const newCloudinaryUrls = await Promise.all(uploadPromises)

            // Combine existing images with new Cloudinary URLs
            const combinedImages = [...currentImages, ...newCloudinaryUrls].slice(0, 5)

            // Update state with new images
            setStateFunction({
                ...stateToUpdate,
                images: combinedImages,
            })

            // Update uploaded images state
            setUploadedImages([...uploadedImages, ...newCloudinaryUrls])
        } catch (error) {
            console.error("Error uploading images to Cloudinary:", error)
        } finally {
            setIsUploading(false)
        }
    }


    // Handle remove image
    const handleRemoveImage = (index) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        const newImages = [...stateToUpdate.images]
        newImages.splice(index, 1)
        setStateFunction({
            ...stateToUpdate,
            images: newImages,
        })
    }


    // Handle review delete confirmation
    const handleReviewDeleteConfirm = (reviewIndex) => {
        const currentGadget = isAddingGadget ? newGadget : editedGadget
        console.log(`Gadget ID: ${currentGadget?._id || currentGadget?.id}, Review Index: ${reviewIndex}`)
        setReviewToDelete(reviewIndex)
        setShowReviewDeleteConfirm(true)
    }


    // Handle delete review
    const handleDeleteReview = () => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget

        if (reviewToDelete === null || !selectedGadget) return

        const updatedReviews = [...stateToUpdate.reviews]
        updatedReviews.splice(reviewToDelete, 1)

        // Recalculate average rating
        const updatedRatings = updatedReviews.map((review) => review.rating)
        const newAverage = updatedRatings.length
            ? updatedRatings.reduce((sum, rating) => sum + rating, 0) / updatedRatings.length
            : 0

        setStateFunction({
            ...stateToUpdate,
            reviews: updatedReviews,
            ratings: updatedRatings,
            average_rating: Number.parseFloat(newAverage.toFixed(1)),
        })

        setShowReviewDeleteConfirm(false)
        setReviewToDelete(null)
    }


    // Handle toggle review visibility
    const handleToggleReviewVisibility = (index) => {
        const stateToUpdate = isAddingGadget ? newGadget : editedGadget
        const setStateFunction = isAddingGadget ? setNewGadget : setEditedGadget
        const currentGadget = isAddingGadget ? newGadget : editedGadget

        console.log(`Gadget ID: ${currentGadget?._id || currentGadget?.id}, Review Index: ${index}`)

        const updatedReviews = [...stateToUpdate.reviews]
        updatedReviews[index].hidden = !updatedReviews[index].hidden

        setStateFunction({
            ...stateToUpdate,
            reviews: updatedReviews,
        })
    }


    // Handle cancel review delete
    const handleCancelReviewDelete = () => {
        setShowReviewDeleteConfirm(false)
        setReviewToDelete(null)
    }


    // Filter and sort gadgets
    const filteredGadgets = gadgets.filter((gadget) => {
        const matchesSearch =
            gadget?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gadget?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gadget?.model?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = categoryFilter === "all" || gadget?.category === categoryFilter

        const matchesAvailability =
            availabilityFilter === "all" ||
            (availabilityFilter === "available" && gadget?.availability?.status) ||
            (availabilityFilter === "unavailable" && !gadget?.availability?.status)

        return matchesSearch && matchesCategory && matchesAvailability
    })


    const sortedGadgets = [...filteredGadgets].sort((a, b) => {
        let aValue, bValue

        if (sortConfig.key === "price") {
            aValue = a?.pricing?.perDay
            bValue = b?.pricing?.perDay
        } else if (sortConfig.key === "rating") {
            aValue = a?.average_rating
            bValue = b?.average_rating
        } else if (sortConfig.key === "rentals") {
            aValue = a?.totalRentalCount
            bValue = b?.totalRentalCount
        } else {
            aValue = a?.[sortConfig.key]
            bValue = b?.[sortConfig.key]
        }

        if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
    })


    // Updated categories list
    const allCategories = categories.map((cat) => cat.name).filter((name) => name !== "All")


    // Get unique categories for filter
    const uniqueCategories = ["all", ...new Set(gadgets.map((gadget) => gadget?.category).filter(Boolean))]


    // Get fully booked dates (where count >= total_copy)
    const getFullyBookedDates = (gadget) => {
        if (!gadget?.availability?.blockedDates || !gadget?.availability?.total_copy) return []

        // Count occurrences of each date
        const dateCounts = {}
        gadget.availability.blockedDates.forEach((date) => {
            dateCounts[date] = (dateCounts[date] || 0) + 1
        })

        // Filter dates where count >= total_copy
        return Object.entries(dateCounts)
            .filter(([date, count]) => count >= gadget.availability.total_copy)
            .map(([date]) => date)
    }


    return (
        <div
            className={`w-full mx-auto pb-8 rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}
        >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-blue-900" : "bg-blue-100"} mr-4`}>
                            <FiPackage className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Gadgets</p>
                            <p className="text-2xl font-semibold">{gadgets.length}</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-purple-900" : "bg-purple-100"} mr-4`}>
                            <FiDollarSign className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Rentals</p>
                            <p className="text-2xl font-semibold">
                                {gadgets.reduce((sum, gadget) => sum + (gadget?.totalRentalCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-yellow-900" : "bg-yellow-100"} mr-4`}>
                            <FiStar className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Average Rating</p>
                            <p className="text-2xl font-semibold">
                                {gadgets.length
                                    ? (gadgets.reduce((sum, gadget) => sum + (gadget?.average_rating || 0), 0) / gadgets.length).toFixed(
                                        1,
                                    )
                                    : "0.0"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-green-900" : "bg-green-100"} mr-4`}>
                            <FiMessageSquare className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Reviews</p>
                            <p className="text-2xl font-semibold">{getTotalReviews()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Gadget List */}
                {(showGadgetList || !isMobileView) && (
                    <div
                        className={`w-full lg:w-1/2 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm overflow-hidden`}
                    >
                        {/* Search and Filter */}
                        <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search gadgets..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                            darkMode
                                                ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                                                : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                    />
                                    <FiSearch
                                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        size={18}
                                    />
                                </div>

                                <button
                                    onClick={handleAddNewGadget}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                                >
                                    <FiPlus className="mr-2" size={18} />
                                    <span>Add Gadget</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => handleCategoryFilter(e.target.value)}
                                        className={`appearance-none pl-4 pr-10 py-2 rounded-lg border ${
                                            darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-800"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer`}
                                    >
                                        <option value="all">All Categories</option>
                                        {uniqueCategories
                                            .filter((cat) => cat !== "all")
                                            .map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                    </select>
                                    <FiChevronDown
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        size={18}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={availabilityFilter}
                                        onChange={(e) => handleAvailabilityFilter(e.target.value)}
                                        className={`appearance-none pl-4 pr-10 py-2 rounded-lg border ${
                                            darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-800"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer`}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                    <FiChevronDown
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        size={18}
                                    />
                                </div>

                                <div className="flex ml-auto">
                                    <button
                                        onClick={() => handleViewModeToggle("grid")}
                                        className={`p-2 rounded-l-lg border-y border-l ${
                                            viewMode === "grid"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : darkMode
                                                    ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                        } cursor-pointer`}
                                    >
                                        <FiGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleViewModeToggle("list")}
                                        className={`p-2 rounded-r-lg border ${
                                            viewMode === "list"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : darkMode
                                                    ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                        } cursor-pointer`}
                                    >
                                        <FiList size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Gadget List */}
                        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                            {sortedGadgets.length > 0 ? (
                                viewMode === "grid" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                                        {sortedGadgets.map((gadget) => (
                                            <div
                                                key={gadget?.id}
                                                onClick={() => handleSelectGadget(gadget)}
                                                className={`rounded-lg border ${
                                                    darkMode
                                                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                                        : "bg-white border-gray-200 hover:bg-gray-50"
                                                } overflow-hidden shadow-sm cursor-pointer transition-colors`}
                                            >
                                                <div className="relative h-40">
                                                    <img
                                                        src={gadget?.images?.[0] || "/placeholder.svg"}
                                                        alt={gadget?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                gadget?.availability?.status
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                            }`}
                                                        >
                                                          {gadget?.availability?.status ? "Available" : "Unavailable"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center">
                                                            {getCategoryIcon(gadget?.category)}
                                                            <span className={`ml-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                {gadget?.category}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FiStar className="text-yellow-500 mr-1" size={14} />
                                                            <span className="text-sm font-medium">{gadget?.average_rating?.toFixed(1) || "0.0"}</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-medium text-lg mb-1 truncate">{gadget?.name}</h3>
                                                    <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {gadget?.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-bold">
                                                            {formatCurrency(gadget?.pricing?.perDay || 0)}
                                                            <span className={`text-xs font-normal ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                /day
                                                            </span>
                                                        </div>
                                                        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                            {gadget?.availability?.total_copy || 0} in stock
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {sortedGadgets.map((gadget, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSelectGadget(gadget)}
                                                className={`p-4 ${
                                                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                                } cursor-pointer transition-colors`}
                                            >
                                                <div className="flex">
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={gadget?.images?.[0] || "/placeholder.svg"}
                                                            alt={gadget?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-medium">{gadget?.name}</h3>
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    gadget?.availability?.status
                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                                }`}
                                                            >
                                                                {gadget?.availability?.status ? "Available" : "Unavailable"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            {getCategoryIcon(gadget?.category)}
                                                            <span className={`ml-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                {gadget?.category}
                                                            </span>
                                                            <span className="mx-2">•</span>
                                                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                {gadget?.brand} {gadget?.model}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="font-bold">
                                                                {formatCurrency(gadget?.pricing?.perDay || 0)}
                                                                <span className={`text-xs font-normal ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                    /day
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <div className="flex items-center mr-4">
                                                                    <FiPackage
                                                                        className={`mr-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                                                        size={14}
                                                                    />
                                                                    <span className="text-sm">{gadget?.availability?.total_copy || 0}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <FiStar className="text-yellow-500 mr-1" size={14} />
                                                                    <span className="text-sm">{gadget?.average_rating?.toFixed(1) || "0.0"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="p-8 text-center">
                                    <FiPackage className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} size={48} />
                                    <p className="text-lg font-medium">No gadgets found</p>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Try adjusting your search or filter
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Gadget Details/Edit */}
                {(!showGadgetList || !isMobileView) && (selectedGadget || isAddingGadget) && (
                    <div
                        className={`w-full lg:w-1/2 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm overflow-hidden flex flex-col`}
                    >
                        {/* Header */}
                        <div
                            className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}
                        >
                            {isMobileView && (
                                <button
                                    onClick={handleBackToGadgetList}
                                    className={`mr-2 p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}
                                >
                                    <FiArrowLeft size={20} />
                                </button>
                            )}

                            <h2 className="text-lg font-semibold">
                                {isAddingGadget ? "Add New Gadget" : editMode ? "Edit Gadget" : "Gadget Details"}
                            </h2>

                            {selectedGadget && !editMode && !isAddingGadget && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEditGadget}
                                        className={`p-2 rounded-lg ${
                                            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                                        } cursor-pointer`}
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteConfirm(selectedGadget)}
                                        className={`p-2 rounded-lg ${
                                            darkMode
                                                ? "bg-red-900/30 hover:bg-red-900/50 text-red-400"
                                                : "bg-red-100 hover:bg-red-200 text-red-600"
                                        } cursor-pointer`}
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            )}

                            {(editMode || isAddingGadget) && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className={`p-2 rounded-lg ${
                                            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                                        } cursor-pointer`}
                                    >
                                        <FiX size={18} />
                                    </button>
                                    <button
                                        onClick={handleSaveGadget}
                                        className={`p-2 rounded-lg ${
                                            darkMode
                                                ? "bg-green-900/30 hover:bg-green-900/50 text-green-400"
                                                : "bg-green-100 hover:bg-green-200 text-green-600"
                                        } cursor-pointer`}
                                    >
                                        <FiCheck size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className={`flex border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                            <button
                                onClick={() => handleTabChange("details")}
                                className={`px-4 py-2 font-medium text-sm ${
                                    selectedTab === "details"
                                        ? darkMode
                                            ? "border-b-2 border-blue-500 text-blue-400"
                                            : "border-b-2 border-blue-500 text-blue-600"
                                        : darkMode
                                            ? "text-gray-400 hover:text-gray-300"
                                            : "text-gray-500 hover:text-gray-700"
                                } cursor-pointer`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => handleTabChange("images")}
                                className={`px-4 py-2 font-medium text-sm ${
                                    selectedTab === "images"
                                        ? darkMode
                                            ? "border-b-2 border-blue-500 text-blue-400"
                                            : "border-b-2 border-blue-500 text-blue-600"
                                        : darkMode
                                            ? "text-gray-400 hover:text-gray-300"
                                            : "text-gray-500 hover:text-gray-700"
                                } cursor-pointer`}
                            >
                                Images
                            </button>
                            <button
                                onClick={() => handleTabChange("pricing")}
                                className={`px-4 py-2 font-medium text-sm ${
                                    selectedTab === "pricing"
                                        ? darkMode
                                            ? "border-b-2 border-blue-500 text-blue-400"
                                            : "border-b-2 border-blue-500 text-blue-600"
                                        : darkMode
                                            ? "text-gray-400 hover:text-gray-300"
                                            : "text-gray-500 hover:text-gray-700"
                                } cursor-pointer`}
                            >
                                Pricing
                            </button>
                            <button
                                onClick={() => handleTabChange("availability")}
                                className={`px-4 py-2 font-medium text-sm ${
                                    selectedTab === "availability"
                                        ? darkMode
                                            ? "border-b-2 border-blue-500 text-blue-400"
                                            : "border-b-2 border-blue-500 text-blue-600"
                                        : darkMode
                                            ? "text-gray-400 hover:text-gray-300"
                                            : "text-gray-500 hover:text-gray-700"
                                } cursor-pointer`}
                            >
                                Availability
                            </button>
                            <button
                                onClick={() => handleTabChange("reviews")}
                                className={`px-4 py-2 font-medium text-sm ${
                                    selectedTab === "reviews"
                                        ? darkMode
                                            ? "border-b-2 border-blue-500 text-blue-400"
                                            : "border-b-2 border-blue-500 text-blue-600"
                                        : darkMode
                                            ? "text-gray-400 hover:text-gray-300"
                                            : "text-gray-500 hover:text-gray-700"
                                } cursor-pointer`}
                            >
                                Reviews
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 300px)" }}>
                            {/* Details Tab */}
                            {selectedTab === "details" && (
                                <div className="space-y-4">
                                    {editMode || isAddingGadget ? (
                                        <>
                                            <div>
                                                <label
                                                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                >
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={isAddingGadget ? newGadget?.name : editedGadget?.name || ""}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-lg border ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-gray-100"
                                                            : "bg-white border-gray-300 text-gray-800"
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Category
                                                    </label>
                                                    <select
                                                        value={isAddingGadget ? newGadget?.category : editedGadget?.category || ""}
                                                        onChange={(e) => handleInputChange("category", e.target.value)}
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {allCategories.map((category) => (
                                                            <option key={category} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Brand
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={isAddingGadget ? newGadget?.brand : editedGadget?.brand || ""}
                                                        onChange={(e) => handleInputChange("brand", e.target.value)}
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                >
                                                    Model
                                                </label>
                                                <input
                                                    type="text"
                                                    value={isAddingGadget ? newGadget?.model : editedGadget?.model || ""}
                                                    onChange={(e) => handleInputChange("model", e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-lg border ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-gray-100"
                                                            : "bg-white border-gray-300 text-gray-800"
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                >
                                                    Description
                                                </label>
                                                <textarea
                                                    value={isAddingGadget ? newGadget?.description : editedGadget?.description || ""}
                                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                                    rows="3"
                                                    className={`w-full px-3 py-2 rounded-lg border ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-gray-100"
                                                            : "bg-white border-gray-300 text-gray-800"
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label
                                                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Specifications
                                                    </label>
                                                    <button
                                                        onClick={handleAddSpecification}
                                                        className={`text-xs px-2 py-1 rounded ${
                                                            darkMode
                                                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        } cursor-pointer`}
                                                    >
                                                        + Add Specification
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {Object.entries(
                                                        isAddingGadget ? newGadget?.specifications || {} : editedGadget?.specifications || {},
                                                    ).map(([key, value]) => (
                                                        <div key={key} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                defaultValue={key}
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== key) {
                                                                        handleSpecificationKeyChange(key, e.target.value)
                                                                    }
                                                                }}
                                                                placeholder="Specification name"
                                                                className={`w-1/3 px-3 py-2 rounded-lg border ${
                                                                    darkMode
                                                                        ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                        : "bg-white border-gray-300 text-gray-800"
                                                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={value || ""}
                                                                onChange={(e) => handleSpecificationValueChange(key, e.target.value)}
                                                                placeholder="Value"
                                                                className={`flex-1 px-3 py-2 rounded-lg border ${
                                                                    darkMode
                                                                        ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                        : "bg-white border-gray-300 text-gray-800"
                                                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                            />
                                                            <button
                                                                onClick={() => handleRemoveSpecification(key)}
                                                                className={`p-2 rounded-lg ${
                                                                    darkMode
                                                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                                } cursor-pointer`}
                                                            >
                                                                <FiX size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label
                                                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Included Items
                                                    </label>
                                                    <button
                                                        onClick={handleAddIncludedItem}
                                                        className={`text-xs px-2 py-1 rounded ${
                                                            darkMode
                                                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        } cursor-pointer`}
                                                    >
                                                        + Add Item
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(isAddingGadget ? newGadget?.included || [] : editedGadget?.included || []).map(
                                                        (item, index) => (
                                                            <div key={index} className="flex items-center">
                                                                <input
                                                                    type="text"
                                                                    value={item || ""}
                                                                    onChange={(e) => handleIncludedChange(index, e.target.value)}
                                                                    className={`flex-1 px-3 py-2 rounded-lg border ${
                                                                        darkMode
                                                                            ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                            : "bg-white border-gray-300 text-gray-800"
                                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                                />
                                                                <button
                                                                    onClick={() => handleRemoveIncludedItem(index)}
                                                                    className={`ml-2 p-2 rounded-lg ${
                                                                        darkMode
                                                                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                                    } cursor-pointer`}
                                                                    disabled={
                                                                        (isAddingGadget ? newGadget?.included || [] : editedGadget?.included || [])
                                                                            .length <= 1
                                                                    }
                                                                >
                                                                    <FiX size={16} />
                                                                </button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <img
                                                        src={selectedGadget?.images?.[0] || "/placeholder.svg"}
                                                        alt={selectedGadget?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-xl font-semibold">{selectedGadget?.name}</h3>
                                                    <div className="flex items-center mt-1">
                                                        {getCategoryIcon(selectedGadget?.category)}
                                                        <span className={`ml-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                            {selectedGadget?.category}
                                                        </span>
                                                        <span className="mx-2">•</span>
                                                        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                            {selectedGadget?.brand} {selectedGadget?.model}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                                <p>{selectedGadget?.description}</p>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    Specifications
                                                </h4>
                                                <div
                                                    className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                                                >
                                                    {Object.entries(selectedGadget?.specifications || {}).map(([key, value]) => (
                                                        <div key={key} className="flex items-start">
                                                            <div>
                                                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                                </p>
                                                                <p className="text-sm">{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    What's Included
                                                </h4>
                                                <ul
                                                    className={`list-disc list-inside p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                                                >
                                                    {(selectedGadget?.included || []).map((item, index) => (
                                                        <li key={index} className="text-sm mb-1">
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Images Tab */}
                            {selectedTab === "images" && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            Gadget Images ({(isAddingGadget ? newGadget?.images?.length : editedGadget?.images?.length) || 0}
                                            /5)
                                        </h3>
                                        {(editMode || isAddingGadget) && (
                                            <button
                                                onClick={handleImageUpload}
                                                disabled={
                                                    ((isAddingGadget ? newGadget?.images?.length : editedGadget?.images?.length) || 0) >= 5 ||
                                                    isUploading
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                                                    ((isAddingGadget ? newGadget?.images?.length : editedGadget?.images?.length) || 0) >= 5 ||
                                                    isUploading
                                                        ? darkMode
                                                            ? "bg-gray-700 text-gray-500"
                                                            : "bg-gray-200 text-gray-400"
                                                        : darkMode
                                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                            : "bg-blue-600 hover:bg-blue-700 text-white"
                                                } cursor-pointer`}
                                            >
                                                {isUploading ? (
                                                    <span>Uploading...</span>
                                                ) : (
                                                    <>
                                                        <FiUpload className="mr-2" size={14} />
                                                        <span>Upload Image</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileSelected}
                                            multiple
                                        />
                                    </div>

                                    {((isAddingGadget ? newGadget?.images?.length : editedGadget?.images?.length) || 0) > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {((isAddingGadget ? newGadget?.images : editedGadget?.images) || []).map((image, index) => (
                                                <div key={index} className="relative rounded-lg overflow-hidden h-48">
                                                    <img
                                                        src={image || "/placeholder.svg"}
                                                        alt={`${(isAddingGadget ? newGadget?.name : editedGadget?.name) || "Gadget"} - ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {(editMode || isAddingGadget) && (
                                                        <button
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            className={`p-8 text-center rounded-lg border-2 border-dashed ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-50"}`}
                                        >
                                            <FiImage className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} size={48} />
                                            <p className="text-lg font-medium">No images uploaded</p>
                                            {(editMode || isAddingGadget) && (
                                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    Click the upload button to add images
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pricing Tab */}
                            {selectedTab === "pricing" && (
                                <div className="space-y-4">
                                    {editMode || isAddingGadget ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Daily Rate ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={(isAddingGadget ? newGadget?.pricing?.perDay : editedGadget?.pricing?.perDay) || 0}
                                                        onChange={(e) =>
                                                            handleInputChange("pricing.perDay", Number.parseFloat(e.target.value) || 0)
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Deposit
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={(isAddingGadget ? newGadget?.pricing?.deposit : editedGadget?.pricing?.deposit) || 0}
                                                        onChange={(e) =>
                                                            handleInputChange("pricing.deposit", Number.parseFloat(e.target.value) || 0)
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Basic Insurance Fee ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            (isAddingGadget
                                                                ? newGadget?.pricing?.basicInsuranceFee
                                                                : editedGadget?.pricing?.basicInsuranceFee) || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange("pricing.basicInsuranceFee", Number.parseFloat(e.target.value) || 0)
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Premium Insurance Fee ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            (isAddingGadget
                                                                ? newGadget?.pricing?.premiumInsuranceFee
                                                                : editedGadget?.pricing?.premiumInsuranceFee) || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange("pricing.premiumInsuranceFee", Number.parseFloat(e.target.value) || 0)
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Daily Rate</p>
                                                    <p className="text-xl font-bold">{formatCurrency(selectedGadget?.pricing?.perDay || 0)}</p>
                                                </div>

                                                <div>
                                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Deposit</p>
                                                    <p className="text-xl font-bold">{formatCurrency(selectedGadget?.pricing?.deposit || 0)}</p>
                                                </div>

                                                <div>
                                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Basic Insurance</p>
                                                    <p className="text-lg font-medium">
                                                        {formatCurrency(selectedGadget?.pricing?.basicInsuranceFee || 0)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Premium Insurance</p>
                                                    <p className="text-lg font-medium">
                                                        {formatCurrency(selectedGadget?.pricing?.premiumInsuranceFee || 0)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-600">
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                        Weekly Rate (7 days)
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatCurrency((selectedGadget?.pricing?.perDay || 0) * 7 * 0.9)}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                        Monthly Rate (30 days)
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatCurrency((selectedGadget?.pricing?.perDay || 0) * 30 * 0.8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Availability Tab */}
                            {selectedTab === "availability" && (
                                <div className="space-y-4">
                                    {editMode || isAddingGadget ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Total Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            (isAddingGadget
                                                                ? newGadget?.availability?.total_copy
                                                                : editedGadget?.availability?.total_copy) || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange("availability.total_copy", Number.parseInt(e.target.value) || 0)
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                    >
                                                        Status
                                                    </label>
                                                    <select
                                                        value={
                                                            (isAddingGadget ? newGadget?.availability?.status : editedGadget?.availability?.status)
                                                                ? "true"
                                                                : "false"
                                                        }
                                                        onChange={(e) => handleInputChange("availability.status", e.target.value === "true")}
                                                        className={`w-full px-3 py-2 rounded-lg border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                : "bg-white border-gray-300 text-gray-800"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                    >
                                                        <option value="true">Available</option>
                                                        <option value="false">Unavailable</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                                >
                                                    Blocked Dates
                                                </label>
                                                <div className="space-y-2">
                                                    {(
                                                        (isAddingGadget
                                                            ? newGadget?.availability?.blockedDates
                                                            : editedGadget?.availability?.blockedDates) || []
                                                    ).map((date, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <input
                                                                type="date"
                                                                value={date}
                                                                onChange={(e) => {
                                                                    const newDates = [
                                                                        ...((isAddingGadget
                                                                            ? newGadget?.availability?.blockedDates
                                                                            : editedGadget?.availability?.blockedDates) || []),
                                                                    ]
                                                                    newDates[index] = e.target.value
                                                                    handleInputChange("availability.blockedDates", newDates)
                                                                }}
                                                                className={`flex-1 px-3 py-2 rounded-lg border ${
                                                                    darkMode
                                                                        ? "bg-gray-700 border-gray-600 text-gray-100"
                                                                        : "bg-white border-gray-300 text-gray-800"
                                                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newDates = [
                                                                        ...((isAddingGadget
                                                                            ? newGadget?.availability?.blockedDates
                                                                            : editedGadget?.availability?.blockedDates) || []),
                                                                    ]
                                                                    newDates.splice(index, 1)
                                                                    handleInputChange("availability.blockedDates", newDates)
                                                                }}
                                                                className={`ml-2 p-2 rounded-lg ${
                                                                    darkMode
                                                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                                } cursor-pointer`}
                                                            >
                                                                <FiX size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const today = new Date().toISOString().split("T")[0]
                                                            handleInputChange("availability.blockedDates", [
                                                                ...((isAddingGadget
                                                                    ? newGadget?.availability?.blockedDates
                                                                    : editedGadget?.availability?.blockedDates) || []),
                                                                today,
                                                            ])
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                                                            darkMode
                                                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        } cursor-pointer`}
                                                    >
                                                        <FiPlus className="mr-2" size={14} />
                                                        <span>Add Blocked Date</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Status</p>
                                                        <div className="flex items-center mt-1">
                                                            <span
                                                                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                                                    selectedGadget?.availability?.status ? "bg-green-500" : "bg-red-500"
                                                                }`}
                                                            ></span>
                                                            <p className="font-medium">
                                                                {selectedGadget?.availability?.status ? "Available" : "Unavailable"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Quantity</p>
                                                        <p className="text-xl font-bold">{selectedGadget?.availability?.total_copy || 0}</p>
                                                    </div>

                                                    <div>
                                                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Rentals</p>
                                                        <p className="text-xl font-bold">{selectedGadget?.totalRentalCount || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    Fully Booked Dates
                                                </h4>
                                                {getFullyBookedDates(selectedGadget).length > 0 ? (
                                                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                            {getFullyBookedDates(selectedGadget).map((date, index) => (
                                                                <div key={index} className="flex items-center">
                                                                    <FiCalendar
                                                                        className={`mr-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                                                        size={14}
                                                                    />
                                                                    <span>{formatDate(date)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"} text-center`}>
                                                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                            No fully booked dates
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {selectedTab === "reviews" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            Customer Reviews ({(isAddingGadget ? newGadget : editedGadget)?.reviews?.length || 0})
                                        </h3>
                                        <div className="flex items-center">
                                            <FiStar className="text-yellow-500 mr-1" size={16} />
                                            <span className="font-medium">
                                                {(isAddingGadget ? newGadget : editedGadget)?.average_rating?.toFixed(1) || "0.0"}
                                            </span>
                                        </div>
                                    </div>

                                    {((isAddingGadget ? newGadget : editedGadget)?.reviews?.length || 0) > 0 ? (
                                        <div className="space-y-4">
                                            {((isAddingGadget ? newGadget : editedGadget)?.reviews || []).map((review, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg ${
                                                        review?.hidden
                                                            ? darkMode
                                                                ? "bg-gray-700/50 border border-gray-600"
                                                                : "bg-gray-100/50 border border-gray-200"
                                                            : darkMode
                                                                ? "bg-gray-700"
                                                                : "bg-gray-50"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start">
                                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <FiUser className={darkMode ? "text-gray-600" : "text-gray-500"} size={20} />
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="font-medium">{review?.reviewer_name}</p>
                                                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                    {formatDate(review?.date)}
                                                                </p>
                                                                <div className="flex items-center mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FiStar
                                                                            key={i}
                                                                            className={`${
                                                                                i < review?.rating
                                                                                    ? "text-yellow-500 fill-current"
                                                                                    : darkMode
                                                                                        ? "text-gray-600"
                                                                                        : "text-gray-300"
                                                                            }`}
                                                                            size={14}
                                                                        />
                                                                    ))}
                                                                    <span className="ml-1 text-xs">{review?.rating?.toFixed(1) || "0.0"}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {(editMode || !isAddingGadget) && (
                                                            <div className="flex">
                                                                <button
                                                                    onClick={() => handleToggleReviewVisibility(index)}
                                                                    className={`p-2 rounded-lg ${
                                                                        darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                                                                    } cursor-pointer`}
                                                                >
                                                                    {review?.hidden ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReviewDeleteConfirm(index)}
                                                                    className={`p-2 rounded-lg ${
                                                                        darkMode ? "hover:bg-gray-600 text-red-400" : "hover:bg-gray-200 text-red-600"
                                                                    } cursor-pointer`}
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={`mt-3 ${review?.hidden ? "opacity-50" : ""}`}>
                                                        <p className="text-sm">{review?.review_text}</p>
                                                    </div>

                                                    {review?.hidden && (
                                                        <div className="mt-2 flex items-center">
                                                            <FiEyeOff className="text-yellow-500 mr-1" size={14} />
                                                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                This review is hidden from users
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`p-8 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                            <FiMessageSquare
                                                className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`}
                                                size={48}
                                            />
                                            <p className="text-lg font-medium">No reviews yet</p>
                                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                This gadget hasn't received any reviews
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                        <div className="fixed inset-0 transition-opacity" onClick={handleCancelDelete}>
                            <div className={`absolute inset-0 ${darkMode ? "bg-gray-900" : "bg-gray-500"} opacity-75`}></div>
                        </div>

                        <div
                            className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
                        >
                            <div className="p-6">
                                <div className="sm:flex sm:items-start">
                                    <div
                                        className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${darkMode ? "bg-red-900" : "bg-red-100"} sm:mx-0 sm:h-10 sm:w-10`}
                                    >
                                        <FiAlertCircle className="text-red-600" size={24} />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium">Delete Gadget</h3>
                                        <div className="mt-2">
                                            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                                Are you sure you want to delete "{gadgetToDelete?.name}"? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleDeleteGadget}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelDelete}
                                        className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 ${
                                            darkMode
                                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm cursor-pointer`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Delete Confirmation Modal */}
            {showReviewDeleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                        <div className="fixed inset-0 transition-opacity" onClick={handleCancelReviewDelete}>
                            <div className={`absolute inset-0 ${darkMode ? "bg-gray-900" : "bg-gray-500"} opacity-75`}></div>
                        </div>

                        <div
                            className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
                        >
                            <div className="p-6">
                                <div className="sm:flex sm:items-start">
                                    <div
                                        className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${darkMode ? "bg-red-900" : "bg-red-100"} sm:mx-0 sm:h-10 sm:w-10`}
                                    >
                                        <FiAlertCircle className="text-red-600" size={24} />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium">Delete Review</h3>
                                        <div className="mt-2">
                                            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                                Are you sure you want to delete this review? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleDeleteReview}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelReviewDelete}
                                        className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 ${
                                            darkMode
                                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm cursor-pointer`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default AdminAllGadgetsComponent;
