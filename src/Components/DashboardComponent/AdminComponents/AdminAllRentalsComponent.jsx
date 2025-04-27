import { useState, useEffect, useContext } from "react"
import { FiSearch, FiEdit, FiChevronDown, FiChevronUp, FiDownload, FiDollarSign, FiCalendar } from "react-icons/fi"
import { BiSort } from "react-icons/bi"
import { BsBoxSeam, BsStarFill, BsStarHalf } from "react-icons/bs"
import { useDispatch, useSelector } from "react-redux"
import AuthContext from "../../../Providers/AuthContext.jsx"
import {getAllRentalOrdersOfAllUsersForAdmin, updateTheDetailsOfARentalOrderByAdmin} from "../../../Features/adminAllRentalOrders/adminAllRentalOrdersSlice.js"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx"
import { useNavigate } from "react-router-dom"


const AdminAllRentalsComponent = () => {

    // State variables
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser } = useContext(AuthContext)
    const dispatch = useDispatch()
    const { allRentalOrdersDellDetails } = useSelector((state) => state.adminAllRentalOrders)

    const axiosSecure = useAxiosSecure()
    const [rentals, setRentals] = useState([])
    const [filteredRentals, setFilteredRentals] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [dateSearchQuery, setDateSearchQuery] = useState("")
    const [sortField, setSortField] = useState("startDate")
    const [sortDirection, setSortDirection] = useState("desc")
    const [statusFilter, setStatusFilter] = useState("all")
    const [shipmentStatusFilter, setShipmentStatusFilter] = useState("all")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editedRental, setEditedRental] = useState(null)
    const [expandedRentalId, setExpandedRentalId] = useState(null)
    const navigate = useNavigate()


    // Get all rental orders of all users on mount
    useEffect(() => {
        if (registeredUser) {
            dispatch(getAllRentalOrdersOfAllUsersForAdmin({ adminEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser])


    // Initialize rentals from allRentalOrdersDellDetails when it's available
    useEffect(() => {
        if (allRentalOrdersDellDetails?.length > 0) {
            const formattedRentals = allRentalOrdersDellDetails.map((rental) => {
                const rentalStreak = rental.rentalStreak[0] || {}
                return {
                    gadget_id: rental.gadget_id,
                    order_id: rental.order_id,
                    gadgetName: rental.gadgetName,
                    gadgetImage: rental.gadgetImage,
                    category: rental.category,
                    startDate: rentalStreak.startDate,
                    endDate: rentalStreak.endDate,
                    status: rental.rentalStatus,
                    shipmentStatus: rental.shipmentStatus,
                    amount: rentalStreak.payableFinalAmount,
                    discount: rentalStreak.discountApplied,
                    membershipTier: rental.customerDetails?.membershipTier,
                    pointsEarned: rentalStreak.pointsEarned,
                    paymentMethod: rentalStreak.paymentMethod,
                    hasInvoice: rental.hasInvoice,
                    isReviewed: rental.isReviewed,
                    rating: rental.rating,
                    userName: rental.customerDetails?.name,
                    userEmail: rental.customerDetails?.email,
                    userPhone: rental.customerDetails?.phone,
                    street: rental.customerDetails?.billingAddress?.street,
                    zipCode: rental.customerDetails?.billingAddress?.zipCode,
                    city: rental.customerDetails?.billingAddress?.city,
                    state: rental.customerDetails?.billingAddress?.state,
                    country: rental.customerDetails?.billingAddress?.country,
                    originalData: rental,
                }
            })
            setRentals(formattedRentals)
            setFilteredRentals(formattedRentals)
        }
    }, [allRentalOrdersDellDetails])


    // Status options for filtering and editing
    const statusOptions = ["active", "canceled", "completed"]
    const shipmentStatusOptions = [
        "processing_order",
        "shipment_started",
        "delivered",
        "return_started",
        "return_received",
    ]


    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }


    // Handle date search input change
    const handleDateSearchChange = (e) => {
        setDateSearchQuery(e.target.value)
    }


    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        if (statusFilter === status) {
            setStatusFilter("all")
        } else {
            setStatusFilter(status)
        }

        // Reset shipment status filter when changing status filter
        if (status !== "active") {
            setShipmentStatusFilter("all")
        }
    }


    // Handle shipment status filter change
    const handleShipmentStatusFilterChange = (status) => {
        if (shipmentStatusFilter === status) {
            setShipmentStatusFilter("all")
        } else {
            setShipmentStatusFilter(status)
        }
    }


    // Filter rentals based on the search query and status filter
    useEffect(() => {
        let result = rentals

        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter((rental) => rental.status === statusFilter)
        }

        // Filter by shipment status if status is active
        if (statusFilter === "active" && shipmentStatusFilter !== "all") {
            result = result.filter((rental) => rental.shipmentStatus === shipmentStatusFilter)
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (rental) =>
                    rental.order_id?.toLowerCase().includes(query) ||
                    rental.gadgetName?.toLowerCase().includes(query) ||
                    rental.userName?.toLowerCase().includes(query) ||
                    rental.userEmail?.toLowerCase().includes(query) ||
                    rental.category?.toLowerCase().includes(query),
            )
        }

        // Filter by date
        if (dateSearchQuery) {
            result = result.filter(
                (rental) => rental.startDate?.includes(dateSearchQuery) || rental.endDate?.includes(dateSearchQuery),
            )
        }

        // Sort results
        result = [...result].sort((a, b) => {
            let comparison = 0

            if (sortField === "amount") {
                comparison = (a.amount || 0) - (b.amount || 0)
            } else if (sortField === "startDate") {
                comparison = new Date(a.startDate || 0) - new Date(b.startDate || 0)
            } else if (sortField === "endDate") {
                comparison = new Date(a.endDate || 0) - new Date(b.endDate || 0)
            } else if (sortField === "gadgetName") {
                comparison = (a.gadgetName || "").localeCompare(b.gadgetName || "")
            } else if (sortField === "userName") {
                comparison = (a.userName || "").localeCompare(b.userName || "")
            }

            return sortDirection === "asc" ? comparison : -comparison
        })

        setFilteredRentals(result)
    }, [rentals, searchQuery, dateSearchQuery, statusFilter, shipmentStatusFilter, sortField, sortDirection])


    // Handle sort change
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }


    // Open edit modal with selected rental
    const handleEditRental = (rental) => {
        setEditedRental({ ...rental })
        setIsEditModalOpen(true)
    }


    // Open details modal with selected rental
    const handleViewDetails = (rental) => {
        if (expandedRentalId === rental.order_id) {
            setExpandedRentalId(null) // Collapse if already expanded
        } else {
            setExpandedRentalId(rental.order_id) // Expand this rental
        }
    }


    // Handle changes in the edit form
    const handleEditChange = (field, value) => {
        setEditedRental((prev) => ({
            ...prev,
            [field]: value,
        }))
    }


    // Save edited rental
    const handleSaveEdit = async () => {
        setRentals((prev) => prev.map((rental) => (rental.order_id === editedRental.order_id ? editedRental : rental)))

        // Create the order details object in the exact structure as the backend
        const updatedRentalOrderObj = {
            _id: editedRental.originalData._id,
            order_id: editedRental.order_id,
            gadget_id: editedRental.gadget_id,
            gadgetName: editedRental.gadgetName,
            gadgetImage: editedRental.gadgetImage,
            category: editedRental.category,
            rentalStreak: [
                {
                    ...editedRental.originalData.rentalStreak[0],
                    startDate: editedRental.startDate,
                    endDate: editedRental.endDate,
                    pointsEarned: editedRental.pointsEarned,
                },
            ],
            blockedDates: editedRental.originalData.blockedDates,
            rentalStatus: editedRental.status,
            shipmentStatus: editedRental.shipmentStatus,
            customerDetails: {
                ...editedRental.originalData.customerDetails,
                billingAddress: {
                    street: editedRental.street,
                    city: editedRental.city,
                    zipCode: editedRental.zipCode,
                    state: editedRental.state,
                    country: editedRental.country,
                },
            },
            hasInvoice: editedRental.hasInvoice,
            isReviewed: editedRental.isReviewed,
            rating: editedRental.rating,
        }

        // Log the full order details object
        console.log(updatedRentalOrderObj)

        // Send the updated order details to the backend
        await dispatch(
            updateTheDetailsOfARentalOrderByAdmin({
                adminEmail: registeredUser?.email,
                updatedRentalOrderObj,
                axiosSecure,
            }),
        )

        setIsEditModalOpen(false)
    }


    // Handle download invoice
    const handleInvoiceClick = async (fullRentalOrderObject) => {
        await navigate(`/dashboard/admin/all_rentals/selected_rental_order/${fullRentalOrderObject?.order_id}/invoice`, {
            state: { fullRentalOrderObject },
        })
    }


    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        } catch (error) {
            return dateString
        }
    }


    // Get status color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return darkMode ? "bg-emerald-900/80 text-emerald-100" : "bg-emerald-100 text-emerald-700"
            case "pending":
            case "processing_order":
            case "shipment_started":
                return darkMode ? "bg-amber-900/80 text-amber-100" : "bg-amber-50 text-amber-600"
            case "completed":
            case "delivered":
            case "return_received":
                return darkMode ? "bg-sky-900/80 text-sky-100" : "bg-sky-50 text-sky-600"
            case "canceled":
            case "return_started":
                return darkMode ? "bg-rose-900/80 text-rose-100" : "bg-rose-50 text-rose-600"
            default:
                return darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
        }
    }


    // Get button color based on the active state
    const getButtonColor = (currentValue, activeValue) => {
        const isActive = currentValue === activeValue

        if (isActive) {
            return darkMode ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-600 text-white hover:bg-blue-700"
        }

        return darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }


    // Format shipment status for display
    const formatShipmentStatus = (status) => {
        if (!status) return ""
        return status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }


    // Render star rating
    const renderRating = (rating) => {
        const fullStars = Math.floor(rating || 0)
        const hasHalfStar = (rating || 0) % 1 !== 0
        const stars = []

        for (let i = 0; i < fullStars; i++) {
            stars.push(<BsStarFill key={`full-${i}`} className="text-yellow-400" />)
        }

        if (hasHalfStar) {
            stars.push(<BsStarHalf key="half" className="text-yellow-400" />)
        }

        const emptyStars = 5 - stars.length
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<BsStarFill key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />)
        }

        return (
            <div className="flex items-center">
                {stars}
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{(rating || 0).toFixed(1)}</span>
            </div>
        )
    }


    return (
        <div
            className={`w-full max-w-7xl mx-auto rounded-xl ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        >
            {/* Search and Filter Bar */}
            <div className="space-y-4 mb-6">
                {/* Search Inputs */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Text Search */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by order ID, gadget, user..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
                                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                    </div>

                    {/* Date Search */}
                    <div className="relative md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                        </div>
                        <input
                            type="date"
                            placeholder="Search by date"
                            value={dateSearchQuery}
                            onChange={handleDateSearchChange}
                            className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
                                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                    </div>
                </div>

                {/* Status Filter and Sort Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Status Filter Buttons - Left Side */}
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilterChange(status)}
                                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${getButtonColor(
                                    statusFilter,
                                    status,
                                )} cursor-pointer`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Sort Buttons - Right Side */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSort("startDate")}
                            className={`flex items-center px-4 py-1 rounded-lg border transition-colors duration-200 ${
                                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                            } cursor-pointer`}
                        >
                            <BiSort className="mr-2" />
                            {sortField === "startDate" ? (
                                <>
                                    Date {sortDirection === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
                                </>
                            ) : (
                                "Date"
                            )}
                        </button>

                        <button
                            onClick={() => handleSort("amount")}
                            className={`flex items-center px-4 py-1 rounded-lg border transition-colors duration-200 ${
                                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                            } cursor-pointer`}
                        >
                            <FiDollarSign className="mr-2" />
                            {sortField === "amount" ? (
                                <>
                                    Amount{" "}
                                    {sortDirection === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
                                </>
                            ) : (
                                "Amount"
                            )}
                        </button>

                        <button
                            onClick={() => handleSort("gadgetName")}
                            className={`flex items-center px-4 py-1 rounded-lg border transition-colors duration-200 ${
                                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                            } cursor-pointer`}
                        >
                            <BsBoxSeam className="mr-2" />
                            {sortField === "gadgetName" ? (
                                <>
                                    Gadget{" "}
                                    {sortDirection === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
                                </>
                            ) : (
                                "Gadget"
                            )}
                        </button>
                    </div>
                </div>

                {/* Shipment Status Filter Buttons - Only show when Active is selected */}
                {statusFilter === "active" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {shipmentStatusOptions.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleShipmentStatusFilterChange(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${getButtonColor(
                                    shipmentStatusFilter,
                                    status,
                                )} cursor-pointer`}
                            >
                                {formatShipmentStatus(status)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Rental Orders List */}
            <div className="space-y-4">
                {filteredRentals.length === 0 ? (
                    <div
                        className={`p-8 text-center rounded-lg border ${
                            darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                        }`}
                    >
                        <p className="text-gray-500 dark:text-gray-400">No rental orders found</p>
                    </div>
                ) : (
                    filteredRentals.map((rental) => (
                        <div
                            key={rental.order_id}
                            className={`p-4 rounded-lg border shadow-sm ${
                                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                            } hover:shadow-md transition-shadow duration-200`}
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Gadget Image */}
                                <div className="w-full md:w-1/6">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img
                                            src={rental.gadgetImage || "/placeholder.svg"}
                                            alt={rental.gadgetName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Rental Details */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold">{rental.gadgetName}</h3>
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span className="mr-2">{rental.order_id}</span>
                                                <span className="mr-2">•</span>
                                                <span>{rental.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                                            <div
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}
                                            >
                                                {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                                            </div>
                                            <div
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.shipmentStatus)}`}
                                            >
                                                {formatShipmentStatus(rental.shipmentStatus)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                                            <p className="font-medium">{rental.userName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{rental.userEmail}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Rental Period</p>
                                            <p className="font-medium">
                                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
                                            <p className="font-medium">${(rental.amount || 0).toFixed(2)}</p>
                                            {rental.discount > 0 && (
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    {rental.discount}% discount applied
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <button
                                            onClick={() => handleViewDetails(rental)}
                                            className={`text-sm px-3 py-1.5 rounded-md transition-colors duration-200 ${
                                                darkMode
                                                    ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            } cursor-pointer`}
                                        >
                                            {expandedRentalId === rental.order_id ? "Less Details" : "View Details"}
                                        </button>

                                        <button
                                            onClick={() => handleEditRental(rental)}
                                            className={`text-sm px-3 py-1.5 rounded-md transition-colors duration-200 ${
                                                darkMode
                                                    ? "bg-indigo-900/80 text-indigo-100 hover:bg-indigo-800"
                                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                            } cursor-pointer`}
                                        >
                                            <FiEdit className="inline mr-1" /> Edit
                                        </button>

                                        {rental.hasInvoice && (
                                            <button
                                                onClick={() => handleInvoiceClick(rental.originalData)}
                                                className={`text-sm px-3 py-1.5 rounded-md transition-colors duration-200 ${
                                                    darkMode
                                                        ? "bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800"
                                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                } cursor-pointer`}
                                            >
                                                <FiDownload className="inline mr-1" /> Invoice
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details Section */}
                            <div
                                className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${
                                    expandedRentalId === rental.order_id ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                            >
                                <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-md font-semibold mb-2">Customer Information</h4>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                                    <p className="font-medium">{rental.userName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                    <p className="font-medium">{rental.userEmail}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                                    <p className="font-medium">{rental.userPhone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</p>
                                                    <p className="font-medium">{rental.street}</p>
                                                    <p className="font-medium">
                                                        {rental.zipCode} {rental.city},
                                                    </p>
                                                    <p className="font-medium">
                                                        {rental.state}, {rental.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-md font-semibold mb-2">Rental Details</h4>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Rental Period</p>
                                                    <p className="font-medium">
                                                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                                                    <p className="font-medium">${(rental.amount || 0).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Discount</p>
                                                    <p className="font-medium">{rental.discount}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                                                    <p className="font-medium">{rental.paymentMethod}</p>
                                                </div>
                                                {rental.isReviewed && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                                                        {renderRating(rental.rating)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Membership Tier</p>
                                                    <p className="font-medium">{rental.membershipTier}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Points Earned</p>
                                                    <p className="font-medium">{rental.pointsEarned}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editedRental && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div
                            className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${
                                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                            }`}
                        >
                            <div className="px-6 pt-6 pb-4 sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium mb-4">Edit Rental Order</h3>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                                                <input
                                                    type="text"
                                                    value={editedRental.order_id}
                                                    disabled
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-gray-100 border-gray-300 text-gray-500"
                                                    } px-3 py-2`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Rental Status
                                                </label>
                                                <select
                                                    value={editedRental.status}
                                                    onChange={(e) => handleEditChange("status", e.target.value)}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-900"
                                                    } px-3 py-2 cursor-pointer`}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Shipment Status
                                                </label>
                                                <select
                                                    value={editedRental.shipmentStatus}
                                                    onChange={(e) => handleEditChange("shipmentStatus", e.target.value)}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-900"
                                                    } px-3 py-2 cursor-pointer`}
                                                >
                                                    {shipmentStatusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {formatShipmentStatus(status)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Start Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={editedRental.startDate}
                                                        onChange={(e) => handleEditChange("startDate", e.target.value)}
                                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-white"
                                                                : "bg-white border-gray-300 text-gray-900"
                                                        } px-3 py-2 cursor-pointer`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={editedRental.endDate}
                                                        onChange={(e) => handleEditChange("endDate", e.target.value)}
                                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-white"
                                                                : "bg-white border-gray-300 text-gray-900"
                                                        } px-3 py-2 cursor-pointer`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Points Earned
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editedRental.pointsEarned}
                                                    onChange={(e) => handleEditChange("pointsEarned", Number.parseInt(e.target.value))}
                                                    min="0"
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                                        darkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-900"
                                                    } px-3 py-2`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Shipping Address
                                                </label>
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editedRental.street}
                                                        onChange={(e) => handleEditChange("street", e.target.value)}
                                                        className={`block w-full rounded-md border-gray-300 shadow-sm ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-white"
                                                                : "bg-white border-gray-300 text-gray-900"
                                                        } px-3 py-2`}
                                                        placeholder="Street Address"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={editedRental.zipCode}
                                                            onChange={(e) => handleEditChange("zipCode", e.target.value)}
                                                            className={`block w-full rounded-md border-gray-300 shadow-sm ${
                                                                darkMode
                                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                                    : "bg-white border-gray-300 text-gray-900"
                                                            } px-3 py-2`}
                                                            placeholder="Zip Code"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedRental.city}
                                                            onChange={(e) => handleEditChange("city", e.target.value)}
                                                            className={`block w-full rounded-md border-gray-300 shadow-sm ${
                                                                darkMode
                                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                                    : "bg-white border-gray-300 text-gray-900"
                                                            } px-3 py-2`}
                                                            placeholder="City"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={editedRental.state}
                                                            onChange={(e) => handleEditChange("state", e.target.value)}
                                                            className={`block w-full rounded-md border-gray-300 shadow-sm ${
                                                                darkMode
                                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                                    : "bg-white border-gray-300 text-gray-900"
                                                            } px-3 py-2`}
                                                            placeholder="State"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedRental.country}
                                                            onChange={(e) => handleEditChange("country", e.target.value)}
                                                            className={`block w-full rounded-md border-gray-300 shadow-sm ${
                                                                darkMode
                                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                                    : "bg-white border-gray-300 text-gray-900"
                                                            } px-3 py-2`}
                                                            placeholder="Country"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50 dark:bg-gray-700">
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                                        darkMode
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer transition-colors duration-200`}
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer transition-colors duration-200 ${
                                        darkMode
                                            ? "bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default AdminAllRentalsComponent;
