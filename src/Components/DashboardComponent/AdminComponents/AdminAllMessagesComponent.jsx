import { useState, useEffect, useRef, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FiSearch, FiFilter, FiSend, FiMessageCircle, FiUser, FiUsers, FiCheck, FiClock, FiMessageSquare, FiArrowLeft, FiCheckCircle } from "react-icons/fi"
import AuthContext from "../../../Providers/AuthContext.jsx"
import { getAllUserMessagesChain, addANewMessageFromAdminToUserMessagesChain, aUserMessagesChainMarkedAsReadByAdmin } from "../../../Features/adminMessages/adminMessagesSlice.js"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx"


const AdminAllMessagesComponent = () => {

    // States
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser } = useContext(AuthContext)
    const dispatch = useDispatch()
    const { allUserMessagesChain } = useSelector((state) => state.adminMessages)

    // States
    const axiosSecure = useAxiosSecure()
    const [searchTerm, setSearchTerm] = useState("")
    const [filterUnread, setFilterUnread] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [messageText, setMessageText] = useState("")
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState({})
    const [isMobileView, setIsMobileView] = useState(false)
    const [showUserList, setShowUserList] = useState(true)
    const [adminToUserResponseRate, setAdminToUserResponseRate] = useState(0);

    const messageEndRef = useRef(null)
    const messageContainerRef = useRef(null)


    // Fetch all user's messages chain on mount
    useEffect(() => {
        if (registeredUser?.email) {
            dispatch(getAllUserMessagesChain({ adminEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser?.email])


    // Initialize data
    useEffect(() => {
        if (allUserMessagesChain?.length > 0) {
            // Map the backend data to the format expected by the component
            const mappedUsers = allUserMessagesChain.map((userChain) => ({
                id: userChain._id,
                name: userChain.user_displayName,
                email: userChain.user_email,
                avatar: userChain.user_photoURL || "/placeholder.svg",
                unreadCount: userChain.unreadByAdmin_count || 0,
            }))

            // Create a message object with user ID as a key
            const mappedMessages = {}
            allUserMessagesChain.forEach((userChain) => {
                if (userChain.message_chain?.length > 0) {
                    mappedMessages[userChain._id] = userChain.message_chain.map((msg, index) => ({
                        id: index + 1,
                        sender: msg.sender,
                        text: msg.text,
                        timestamp: msg.timestamp,
                        read: msg.sender === "user" ? msg.readByAdmin !== false : msg.readByUser !== false,
                    }))
                }
            })

            setUsers(mappedUsers)
            setMessages(mappedMessages)
        }

        // Check if mobile view
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1024)
        }

        handleResize()
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [allUserMessagesChain])


    // Scroll to the bottom of messages when a selected user changes or a new message is added
    useEffect(() => {
        if (messageEndRef.current && messageContainerRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
        window.scrollTo({
            top: 0,
            // behavior: 'smooth'
        });
    }, [selectedUser, messages])


    // Filter users based on search term and unread filter
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesUnread = filterUnread ? user.unreadCount > 0 : true

        return matchesSearch && matchesUnread
    })


    // Format timestamp to readable time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }


    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Today"
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday"
        } else {
            return date.toLocaleDateString([], { month: "short", day: "numeric" })
        }
    }


    // Calculate admin to user response rate
    useEffect(() => {
        if (allUserMessagesChain?.length > 0) {

            // Calculate total messages where the sender is "user"
            const totalUserMsgCount = allUserMessagesChain.reduce((sum, allUserMessagesChain) => {
                return sum + allUserMessagesChain?.message_chain.filter(msg => msg.sender === "user").length;
            }, 0);

            // Calculate total admin unread messages (sum of all unreadByAdmin_count)
            const totalAdminUnreadMsgCount = allUserMessagesChain.reduce((sum, allUserMessagesChain) => {
                return sum + allUserMessagesChain?.unreadByAdmin_count;
            }, 0);


            // If there are no user messages, return 100% (nothing to respond to)
            if (totalUserMsgCount === 0) {
                return 100;
            }

            // Calculate response rate
            const unreadPercentage = (totalAdminUnreadMsgCount / totalUserMsgCount) * 100;
            let responseRate = (100 - Math.min(unreadPercentage, 100)).toFixed(2);
            setAdminToUserResponseRate(responseRate)
        }
    }, [allUserMessagesChain]);


    // Check if the date should be displayed (first message of the day)
    const shouldDisplayDate = (message, index, messageList) => {
        if (index === 0) return true

        const prevMessage = messageList[index - 1]
        const prevDate = new Date(prevMessage.timestamp).toDateString()
        const currentDate = new Date(message.timestamp).toDateString()

        return prevDate !== currentDate
    }


    // Handle sending a new message
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedUser) return

        const newMessageObjFromAdmin = {
            sender: "admin",
            text: messageText,
            timestamp: Date.now(),
            readByUser: false,
        }

        // Sending the message to the backend
        await dispatch(
            addANewMessageFromAdminToUserMessagesChain({
                adminEmail: registeredUser.email,
                targetUserId: selectedUser,
                newMessageObjFromAdmin,
                axiosSecure,
            }),
        )

        setMessageText("")
    }


    // Handle selecting a user
    const handleSelectUser = (userId) => {
        setSelectedUser(userId)

        // Mark all messages as read
        if (messages[userId]) {
            const updatedMessages = messages[userId].map((msg) => ({
                ...msg,
                read: true,
            }))

            setMessages((prev) => ({
                ...prev,
                [userId]: updatedMessages,
            }))

            // Update unread count
            setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, unreadCount: 0 } : user)))
        }

        // On mobile, hide a user list when a user is selected
        if (isMobileView) {
            setShowUserList(false)
        }
    }


    // Handle key press in message input
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }


    // Handle marks all as read
    const handleMarkAllAsRead = async () => {
        if (selectedUser) {
            const adminEmail = registeredUser?.email;
            const targetUserEmail = users.find((u) => u.id === selectedUser)?.email;

            await dispatch(aUserMessagesChainMarkedAsReadByAdmin({adminEmail, targetUserEmail, axiosSecure}))
        }
    }


    // Get total unread messages
    const getTotalUnreadMessages = () => {
        return users.reduce((total, user) => total + (user.unreadCount || 0), 0)
    }


    // Back to a user list (mobile only)
    const handleBackToUserList = () => {
        setShowUserList(true)
    }


    return (
        <div
            className={`w-full mx-auto pb-8 rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"} overflow-hidden`}
        >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-blue-900" : "bg-blue-100"} mr-4`}>
                            <FiUsers className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Conversations</p>
                            <p className="text-2xl font-semibold">{Object.keys(messages).length}</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-red-900" : "bg-red-100"} mr-4`}>
                            <FiMessageCircle className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Unread Messages</p>
                            <p className="text-2xl font-semibold">{getTotalUnreadMessages()}</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} shadow-sm`}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${darkMode ? "bg-green-900" : "bg-green-100"} mr-4`}>
                            <FiClock className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Response Rate</p>
                            <p className="text-2xl font-semibold">{adminToUserResponseRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-300px)]">
                {/* User List */}
                {(showUserList || !isMobileView) && (
                    <div
                        className={`w-full lg:w-1/3 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm overflow-hidden flex flex-col`}
                    >
                        {/* Search and Filter */}
                        <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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

                            <div className="flex items-center">
                                <button
                                    onClick={() => setFilterUnread(!filterUnread)}
                                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                                        filterUnread
                                            ? "bg-blue-600 text-white"
                                            : darkMode
                                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    } cursor-pointer`}
                                >
                                    <FiFilter className="mr-2" size={14} />
                                    {filterUnread ? "Show All" : "Show Unread"}
                                </button>

                                <div className={`ml-auto text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
                                </div>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="overflow-y-auto flex-1">
                            {filteredUsers.length > 0 ? (
                                <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                                    {filteredUsers.map((user) => (
                                        <li
                                            key={user.id}
                                            onClick={() => handleSelectUser(user.id)}
                                            className={`p-4 hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} cursor-pointer ${
                                                selectedUser === user.id ? (darkMode ? "bg-gray-700" : "bg-gray-100") : ""
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <div className="relative">
                                                    <img
                                                        src={user.avatar || "/placeholder.svg"}
                                                        alt={user.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    {user.unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full p-3 w-5 h-5 flex items-center justify-center">
                                                            {user.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium truncate">{user.name}</p>
                                                    </div>
                                                    <p className={`text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-8 text-center">
                                    <FiUser className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} size={48} />
                                    <p className="text-lg font-medium">No users found</p>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Try adjusting your search or filter
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Thread */}
                {(!showUserList || !isMobileView) && (
                    <div
                        className={`w-full lg:w-2/3 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm overflow-hidden flex flex-col`}
                    >
                        {selectedUser ? (
                            <>
                                {/* Message Header */}
                                <div
                                    className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}
                                >
                                    <div className="flex items-center">
                                        {isMobileView && (
                                            <button
                                                onClick={handleBackToUserList}
                                                className={`mr-2 p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}
                                            >
                                                <FiArrowLeft size={20} />
                                            </button>
                                        )}

                                        <img
                                            src={users.find((u) => u.id === selectedUser)?.avatar || "/placeholder.svg"}
                                            alt={users.find((u) => u.id === selectedUser)?.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="ml-3">
                                            <p className="font-medium">{users.find((u) => u.id === selectedUser)?.name}</p>
                                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {users.find((u) => u.id === selectedUser)?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                                            darkMode
                                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        } cursor-pointer`}
                                    >
                                        <FiCheckCircle className="mr-2 text-green-500" size={14} />
                                        Mark all as read
                                    </button>
                                </div>

                                {/* Message Thread */}
                                <div
                                    ref={messageContainerRef}
                                    className={`flex-1 p-4 overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
                                >
                                    {messages[selectedUser] && messages[selectedUser].length > 0 ? (
                                        <div className="space-y-4">
                                            {messages[selectedUser].map((message, index) => (
                                                <div key={message.id}>
                                                    {shouldDisplayDate(message, index, messages[selectedUser]) && (
                                                        <div className="flex justify-center my-4">
                                                            <div
                                                                className={`px-3 py-1 rounded-full text-xs ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}
                                                            >
                                                                {formatDate(message.timestamp)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                                                        <div
                                                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                                                message.sender === "admin"
                                                                    ? darkMode
                                                                        ? "bg-blue-600 text-white"
                                                                        : "bg-blue-500 text-white"
                                                                    : darkMode
                                                                        ? "bg-gray-800 text-gray-100"
                                                                        : "bg-white text-gray-800"
                                                            }`}
                                                        >
                                                            <div className="text-sm">{message.text}</div>
                                                            <div
                                                                className={`text-xs mt-1 flex items-center justify-end ${
                                                                    message.sender === "admin"
                                                                        ? "text-blue-100"
                                                                        : darkMode
                                                                            ? "text-gray-400"
                                                                            : "text-gray-500"
                                                                }`}
                                                            >
                                                                {formatTime(message.timestamp)}
                                                                {message.sender === "admin" && <FiCheck className="ml-1" size={12} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messageEndRef} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center">
                                            <FiMessageSquare className={`${darkMode ? "text-gray-700" : "text-gray-300"} mb-4`} size={48} />
                                            <p className="text-lg font-medium">No messages yet</p>
                                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                Send a message to start the conversation
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                                    <div className="flex items-end">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Type your message..."
                                                className={`w-full px-4 py-3 pr-12 rounded-lg resize-none ${
                                                    darkMode
                                                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                                                        : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                                                } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                rows="1"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!messageText.trim()}
                                                className={`absolute right-2 bottom-2 p-2 rounded-full ${
                                                    !messageText.trim()
                                                        ? darkMode
                                                            ? "text-gray-500"
                                                            : "text-gray-300"
                                                        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600"
                                                } cursor-pointer`}
                                            >
                                                <FiSend size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8">
                                <FiMessageCircle className={`${darkMode ? "text-gray-700" : "text-gray-300"} mb-4`} size={64} />
                                <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                                <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Select a user from the list to view and manage your conversation
                                </p>
                                {isMobileView && (
                                    <button
                                        onClick={handleBackToUserList}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                                    >
                                        View User List
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminAllMessagesComponent;
