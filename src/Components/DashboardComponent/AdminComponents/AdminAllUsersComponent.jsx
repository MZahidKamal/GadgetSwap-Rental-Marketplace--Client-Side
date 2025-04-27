import React, { useState, useEffect, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiChevronDown, FiChevronUp, FiMoreHorizontal, FiUser, FiUsers, FiUserPlus as FiNewUsers, FiClock, FiCalendar, FiMail, FiPhone, FiMapPin, FiShield, FiAward } from "react-icons/fi"
import AuthContext from "../../../Providers/AuthContext.jsx"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx"
import { getAllUsersFullDetailsForAdmin, deleteAUserCompletelyWithNoRentalOrder } from "../../../Features/adminAllUsers/adminAllUsersSlice.js"
import {toast} from "react-toastify";


const AdminAllUsersComponent = () => {

    // States
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser } = useContext(AuthContext)
    const dispatch = useDispatch()
    const { allUsersFullDetails } = useSelector((state) => state.adminAllUsers)

    const axiosSecure = useAxiosSecure()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [usersPerPage] = useState(7)
    const [sortConfig, setSortConfig] = useState({ key: "displayName", direction: "ascending" })
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterRole, setFilterRole] = useState("all")
    const [expandedUser, setExpandedUser] = useState(null)
    const [isActionMenuOpen, setIsActionMenuOpen] = useState({})


    // Fetch all user's full details on the mount
    useEffect(() => {
        if (registeredUser?.email) {
            dispatch(getAllUsersFullDetailsForAdmin({ adminEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser?.email])


    // User statistics
    const userStats = {
        totalUsers: allUsersFullDetails?.length || 0,
        activeUsers: allUsersFullDetails?.filter((user) => user?.personalDetails?.verified)?.length || 0,
        inactiveUsers: allUsersFullDetails?.filter((user) => !user?.personalDetails?.verified)?.length || 0,
        admins: allUsersFullDetails?.filter((user) => user?.role === "admin")?.length || 0,
        regularUsers: allUsersFullDetails?.filter((user) => user?.role === "user")?.length || 0,
        newUsersThisMonth:
            allUsersFullDetails?.filter((user) => {
                const joinDate = new Date(user?.joinDate)
                const now = new Date()
                return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
            })?.length || 0,
    }


    // Functions
    const requestSort = (key) => {
        let direction = "ascending"
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending"
        }
        setSortConfig({ key, direction })
    }


    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    }


    const formatTime = (dateString) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }


    const getStatusColor = (verified) => {
        if (verified) {
            return darkMode ? "text-green-400" : "text-green-600"
        } else {
            return darkMode ? "text-yellow-400" : "text-yellow-600"
        }
    }


    const getRoleColor = (role) => {
        switch (role) {
            case "admin":
                return darkMode ? "text-purple-400" : "text-purple-600"
            case "user":
                return darkMode ? "text-gray-400" : "text-gray-600"
            default:
                return ""
        }
    }


    const toggleActionMenu = (userId) => {
        setIsActionMenuOpen((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }))
    }


    const toggleUserExpand = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId)
    }


    const handleUserAction = (user, action) => {
        if (action === "edit") {
            // console.log(`Editing user: ${user.displayName}`)
            toast.warning("Editing users is only possible from the user profile page.")
        }
        else if (action === "delete") {
            if (registeredUser && user?.role === "user") {
                dispatch(deleteAUserCompletelyWithNoRentalOrder({adminEmail:registeredUser?.email, targetUserId: user._id, axiosSecure}))
            }
            toast.success("Successfully deleted user.")
        }

        setIsActionMenuOpen((prev) => ({
            ...prev,
            [user._id]: false,
        }))
    }


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }


    const handleFilterChange = (type, value) => {
        if (type === "status") {
            setFilterStatus(value)
        } else if (type === "role") {
            setFilterRole(value)
        }
        setCurrentPage(1)
    }


    // Filter and sort users
    const filteredUsers =
        allUsersFullDetails?.filter((user) => {
            const matchesSearch =
                user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "verified" && user?.personalDetails?.verified) ||
                (filterStatus === "unverified" && !user?.personalDetails?.verified)

            const matchesRole = filterRole === "all" || user?.role === filterRole

            return matchesSearch && matchesStatus && matchesRole
        }) || []


    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle nested properties
        if (sortConfig.key === "verified") {
            aValue = a.personalDetails?.verified
            bValue = b.personalDetails?.verified
        }

        if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
    })


    // Pagination
    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage)


    const paginate = (pageNumber) => setCurrentPage(pageNumber)


    // Effect to reset the action menu when users change
    useEffect(() => {
        setIsActionMenuOpen({})
    }, [currentPage, filterStatus, filterRole, searchTerm, sortConfig])


    return (
        <div
            className={`w-full max-w-7xl mx-auto pb-8 rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "border border-gray-200 bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-blue-900" : "bg-blue-100"} mr-4`}>
                            <FiUsers className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Users</p>
                            <p className="text-2xl font-semibold">{userStats.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "border border-gray-200 bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-green-900" : "bg-green-100"} mr-4`}>
                            <FiUserCheck className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Verified Users</p>
                            <p className="text-2xl font-semibold">{userStats.activeUsers}</p>
                        </div>
                    </div>
                </div>
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "border border-gray-200 bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-purple-900" : "bg-purple-100"} mr-4`}>
                            <FiShield className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Admins</p>
                            <p className="text-2xl font-semibold">{userStats.admins}</p>
                        </div>
                    </div>
                </div>
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "border border-gray-200 bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-teal-900" : "bg-teal-100"} mr-4`}>
                            <FiNewUsers className="text-teal-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>New This Month</p>
                            <p className="text-2xl font-semibold">{userStats.newUsersThisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            darkMode
                                ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500"
                                : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    />
                    <FiSearch
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        size={18}
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                            className={`appearance-none pl-4 pr-10 py-2 rounded-lg border cursor-pointer ${
                                darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-800"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                        >
                            <option value="all">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                        <FiChevronDown
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            size={18}
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterRole}
                            onChange={(e) => handleFilterChange("role", e.target.value)}
                            className={`appearance-none pl-4 pr-10 py-2 rounded-lg border cursor-pointer ${
                                darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-800"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <FiChevronDown
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            size={18}
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div
                className={`max-h-[calc(100vh-400px)] overflow-x-auto rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"} shadow-sm mb-6`}
            >
                <table className={`min-w-full divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <button onClick={() => requestSort("displayName")} className="flex items-center">
                                <span>User</span>
                                {sortConfig.key === "displayName" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <FiChevronUp className="ml-1" size={16} />
                                    ) : (
                                        <FiChevronDown className="ml-1" size={16} />
                                    ))}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <button onClick={() => requestSort("role")} className="flex items-center">
                                <span>Role</span>
                                {sortConfig.key === "role" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <FiChevronUp className="ml-1" size={16} />
                                    ) : (
                                        <FiChevronDown className="ml-1" size={16} />
                                    ))}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <button onClick={() => requestSort("verified")} className="flex items-center">
                                <span>Status</span>
                                {sortConfig.key === "verified" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <FiChevronUp className="ml-1" size={16} />
                                    ) : (
                                        <FiChevronDown className="ml-1" size={16} />
                                    ))}
                            </button>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell"
                        >
                            <button onClick={() => requestSort("lastLogin")} className="flex items-center">
                                <span>Last Login</span>
                                {sortConfig.key === "lastLogin" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <FiChevronUp className="ml-1" size={16} />
                                    ) : (
                                        <FiChevronDown className="ml-1" size={16} />
                                    ))}
                            </button>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell"
                        >
                            <button onClick={() => requestSort("stats.activeRentals")} className="flex items-center">
                                <span>Rentals</span>
                                {sortConfig.key === "stats.activeRentals" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <FiChevronUp className="ml-1" size={16} />
                                    ) : (
                                        <FiChevronDown className="ml-1" size={16} />
                                    ))}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-900" : "divide-gray-200 bg-white"}`}>
                    {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                            <React.Fragment key={user._id}>
                                <tr
                                    className={`${expandedUser === user._id ? (darkMode ? "bg-gray-800" : "bg-gray-50") : ""} hover:${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={user.personalDetails?.photoURL || "/placeholder.svg"}
                                                    alt={user.displayName}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium">{user.displayName}</div>
                                                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)} ${darkMode ? "bg-opacity-20 bg-gray-700" : "bg-opacity-20 bg-gray-200"}`}
                                        >
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.personalDetails?.verified)} ${darkMode ? "bg-opacity-20 bg-gray-700" : "bg-opacity-20 bg-gray-200"}`}
                                        >
                                        {user.personalDetails?.verified ? "Verified" : "Unverified"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div className="text-sm">{formatDate(user.lastLogin)}</div>
                                        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {formatTime(user.lastLogin)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                        <div className="text-sm">{(user.stats?.activeRentals || 0) + (user.stats?.pastRentals || 0)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button
                                                onClick={() => toggleUserExpand(user._id)}
                                                className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} cursor-pointer`}
                                            >
                                                {expandedUser === user._id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleActionMenu(user._id)}
                                                    className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} cursor-pointer`}
                                                >
                                                    <FiMoreHorizontal size={18} />
                                                </button>
                                                {isActionMenuOpen[user._id] && (
                                                    <div
                                                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"} ring-1 ring-black ring-opacity-5 z-10`}
                                                    >
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleUserAction(user, "edit")}
                                                                className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? "text-gray-100 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"} cursor-pointer`}
                                                            >
                                                                <FiEdit2 className="mr-2" size={16} />
                                                                Edit User
                                                            </button>
                                                            <button
                                                                onClick={() => handleUserAction(user, "delete")}
                                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer"
                                                            >
                                                                <FiTrash2 className="mr-2" size={16} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                {expandedUser === user._id && (
                                    <tr className={darkMode ? "bg-gray-800" : "bg-gray-50"}>
                                        <td colSpan={7} className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                                                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} space-y-2`}>
                                                        <div className="flex items-center">
                                                            <FiMail className="mr-2" size={16} />
                                                            <span>{user.email}</span>
                                                        </div>
                                                        {user.personalDetails?.phone && <div className="flex items-center">
                                                            <FiPhone className="mr-2" size={16}/>
                                                            <span>{user.personalDetails?.phone || "N/A"}</span>
                                                        </div>}
                                                        {user.personalDetails?.billingAddress.street && <div className="flex flex-col items-start">

                                                            <span className={'flex justify-center items-center'}>
                                                                <FiMapPin className="mr-2" size={16}/>
                                                                {user.personalDetails?.billingAddress
                                                                    ? `${user.personalDetails.billingAddress.street}`
                                                                    : "N/A"}
                                                            </span>
                                                            <span>
                                                                {user.personalDetails?.billingAddress
                                                                    ? `${user.personalDetails.billingAddress.zipCode} - ${user.personalDetails.billingAddress.city}, ${user.personalDetails.billingAddress.country}`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Account Information</h4>
                                                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} space-y-2`}>
                                                        <div className="flex items-center">
                                                            <FiShield className="mr-2" size={16} />
                                                            <span>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FiCalendar className="mr-2" size={16} />
                                                            <span>Joined: {formatDate(user.joinDate)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FiClock className="mr-2" size={16} />
                                                            <span>
                                                                Last Login: {formatDate(user.lastLogin)} at {formatTime(user.lastLogin)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Activity & Membership</h4>
                                                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} space-y-2`}>
                                                        <div className="flex items-center">
                                                            <FiAward className="mr-2" size={16} />
                                                            <span>Tier: {user.membershipDetails?.membershipTier || "N/A"}</span>
                                                        </div>
                                                        <div>Points: {user.membershipDetails?.points || 0}</div>
                                                        <div>Status: {user.personalDetails?.verified ? "Verified" : "Unverified"}</div>
                                                        <div>
                                                            Total Rentals: {(user.stats?.activeRentals || 0) + (user.stats?.pastRentals || 0)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center justify-center py-6">
                                    <FiUser className={`${darkMode ? "text-gray-600" : "text-gray-400"} mb-2`} size={48} />
                                    <p className="text-lg font-medium">No users found</p>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Try adjusting your search or filter to find what you're looking for.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length}{" "}
                        users
                    </div>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${
                                currentPage === 1
                                    ? `${darkMode ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                                    : `${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`
                            }`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === number
                                        ? "bg-blue-600 text-white"
                                        : `${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`
                                }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${
                                currentPage === totalPages
                                    ? `${darkMode ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                                    : `${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminAllUsersComponent;
