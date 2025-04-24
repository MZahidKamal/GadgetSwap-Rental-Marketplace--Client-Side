import { useState, useRef, useEffect, useContext } from "react"
import { FiSend, FiCalendar, FiChevronDown, FiInfo, FiFilter, FiClock } from "react-icons/fi"
import {useDispatch, useSelector} from "react-redux"
import AuthContext from "../../../Providers/AuthContext.jsx"
import {getUserMessagesChain, addANewMessageToUserMessagesChain} from "../../../Features/userMessages/userMessagesSlice.js"
import useAxiosSecure from "../../../CustomHooks/useAxiosSecure.jsx";


const UserMessagesComponent = () => {

    // State management
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser } = useContext(AuthContext)
    const dispatch = useDispatch();
    const {userMessagesChain} = useSelector((state) => state.userMessages)

    const axiosSecure = useAxiosSecure();
    const [messages, setMessages] = useState(null)
    const [newMessage, setNewMessage] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [showAllMessages, setShowAllMessages] = useState(false)

    // Refs
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)


    // Fetch user's messages chain on mount
    useEffect(() => {
        if (registeredUser?.email) {
            dispatch(getUserMessagesChain({ userEmail: registeredUser?.email, axiosSecure }))
        }
    }, [axiosSecure, dispatch, registeredUser?.email]);


    // After fetching setting the message chain in state
    useEffect(() => {
        if(userMessagesChain) {
            setMessages(userMessagesChain?.message_chain);
        }
    }, [userMessagesChain]);


    // Format timestamp to readable time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }


    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })
    }


    // Check if a message is from today
    const isToday = (timestamp) => {
        const today = new Date()
        const messageDate = new Date(timestamp)
        return (
            messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear()
        )
    }


    // Check if a message is from yesterday
    const isYesterday = (timestamp) => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const messageDate = new Date(timestamp)
        return (
            messageDate.getDate() === yesterday.getDate() &&
            messageDate.getMonth() === yesterday.getMonth() &&
            messageDate.getFullYear() === yesterday.getFullYear()
        )
    }


    // Get a formatted date label
    const getDateLabel = (timestamp) => {
        if (isToday(timestamp)) return "Today"
        if (isYesterday(timestamp)) return "Yesterday"
        return formatDate(timestamp)
    }


    // Check if the date should be displayed (first message of the day)
    const shouldDisplayDate = (message, index) => {
        if (index === 0) return true

        const prevMessage = messages[index - 1]
        const prevDate = new Date(prevMessage.timestamp).toLocaleDateString()
        const currentDate = new Date(message.timestamp).toLocaleDateString()

        return prevDate !== currentDate
    }


    // Scroll to bottom of message container
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }


    // Handle sending a new message
    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return

        const userMessageObj = {
            sender: "user",
            text: newMessage,
            timestamp: new Date().getTime(),
            readByAdmin: false,
        }
        // console.log("User Message:", userMessageObj)
        dispatch(addANewMessageToUserMessagesChain({ userEmail: registeredUser?.email, newMessageObj: userMessageObj, axiosSecure }))
        setNewMessage("")

        // Simulate admin response after 1 second
        /*setTimeout(() => {
            const adminResponse = {
                sender: "admin",
                text: "Thanks for your message! Our team will get back to you shortly.",
                timestamp: new Date().getTime(),
                readByUser: true,
            }
            // console.log("Admin Response:", adminResponse)
            dispatch(addANewMessageToUserMessagesChain({ userEmail: registeredUser?.email, newMessageObj: adminResponse, axiosSecure }))
        }, 1500)*/
        // TODO: Uncomment this snippet only if you want to simulate automatic admin response.
    }


    // Handle key press in message input
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage().then();
        }
    }


    // Handle date selection
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
        setShowAllMessages(false)

        // Find the first message of the selected date
        const selectedTimestamp = new Date(e.target.value).getTime()
        const nextDay = new Date(e.target.value)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayTimestamp = nextDay.getTime()

        const messageIndex = messages.findIndex(
            (msg) => msg.timestamp >= selectedTimestamp && msg.timestamp < nextDayTimestamp,
        )

        if (messageIndex !== -1 && messagesContainerRef.current) {
            const messageElements = messagesContainerRef.current.querySelectorAll(".message-item")
            if (messageElements[messageIndex]) {
                messageElements[messageIndex].scrollIntoView({ behavior: "smooth" })
            }
        }
    }


    // Handle showing all messages
    const handleShowAllMessages = () => {
        setShowAllMessages(true)
        setTimeout(scrollToBottom, 100)
    }


    // Handle showing today's messages
    const handleShowTodayMessages = () => {
        const today = new Date().toISOString().split("T")[0]
        setSelectedDate(today)
        setShowAllMessages(false)

        // Find the first message of today
        const todayTimestamp = new Date(today).getTime()
        const nextDay = new Date(today)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayTimestamp = nextDay.getTime()

        const messageIndex = messages.findIndex(
            (msg) => msg.timestamp >= todayTimestamp && msg.timestamp < nextDayTimestamp,
        )

        if (messageIndex !== -1 && messagesContainerRef.current) {
            const messageElements = messagesContainerRef.current.querySelectorAll(".message-item")
            if (messageElements[messageIndex]) {
                //messageElements[messageIndex].scrollIntoView({ behavior: "smooth" })
                setTimeout(scrollToBottom, 100)
            }
        }
    }


    // Handle scroll event to show/hide scroll button
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
            const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100
            setShowScrollButton(isScrolledUp)
        }
    }


    // Filter messages by a selected date
    const getFilteredMessages = () => {
        if (showAllMessages) return messages

        if (!selectedDate) return messages

        const selectedDateObj = new Date(selectedDate)
        const nextDay = new Date(selectedDate)
        nextDay.setDate(nextDay.getDate() + 1)

        return messages?.filter((message) => {
            const messageDate = new Date(message.timestamp)
            return messageDate >= selectedDateObj && messageDate < nextDay
        })
    }


    // Scroll to the bottom on an initial load
    useEffect(() => {
        scrollToBottom()
    }, [])


    // Scroll to the bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])


    // Add a scroll event listener
    useEffect(() => {
        const container = messagesContainerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [])


    return (
        <div className={`w-full mx-auto rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
            {/* Messages Container */}
            <div
                className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
            >
                {/* Date Picker */}
                <div
                    className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex flex-wrap justify-between items-center`}
                >
                    <div className="flex items-center">
                        <FiCalendar className={`mr-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className={`px-2 py-1 rounded-md ${
                                darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-50 border-gray-300 text-gray-700"
                            } border focus:outline-none focus:ring-1 focus:ring-blue-500 ${showAllMessages ? "opacity-50" : ""}`}
                            disabled={showAllMessages}
                        />
                        <div className="flex ml-2 space-x-1">
                            <button
                                onClick={handleShowTodayMessages}
                                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                                    !showAllMessages && selectedDate === new Date().toISOString().split("T")[0]
                                        ? darkMode
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-500 text-white"
                                        : darkMode
                                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                title="Show today's messages"
                            >
                                <div className={'flex text-sm text-gray-300 justify-center items-center gap-2 px-2'}>
                                    Today Only
                                    <FiFilter size={16} />
                                </div>

                            </button>
                            <button
                                onClick={handleShowAllMessages}
                                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                                    showAllMessages
                                        ? darkMode
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-500 text-white"
                                        : darkMode
                                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                title="Show all messages"
                            >
                                <div className={'flex text-sm text-gray-300 justify-center items-center gap-2 px-2'}>
                                    All Messages
                                    <FiClock size={16} />
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {showAllMessages ? messages?.length : getFilteredMessages()?.length} messages
                        {showAllMessages ? " (all)" : ""}
                    </div>
                </div>

                {/* Messages List */}
                <div
                    ref={messagesContainerRef}
                    className="px-10 py-4 h-[calc(100vh-300px)] min-h-[400px] overflow-y-auto"
                    onScroll={handleScroll}
                >
                    {getFilteredMessages()?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <FiInfo size={48} className={`mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                            <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {showAllMessages ? "No messages found" : "No messages on this date"}
                            </p>
                        </div>
                    ) : (
                        getFilteredMessages()?.map((message, index) => (
                            <div key={index} className="message-item">
                                {shouldDisplayDate(message, index) && (
                                    <div className="flex justify-center my-4">
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs ${
                                                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {getDateLabel(message.timestamp)}
                                        </div>
                                    </div>
                                )}

                                <div className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                                        <div
                                            className={`px-4 py-2 rounded-xl text-sm ${
                                                message.sender === "user"
                                                    ? darkMode
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-500 text-white"
                                                    : darkMode
                                                        ? "bg-gray-700 text-gray-200"
                                                        : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {message.text}
                                        </div>
                                        <div
                                            className={`text-xs mt-1 ${
                                                darkMode ? "text-gray-400" : "text-gray-500"
                                            } ${message.sender === "user" ? "text-right" : "text-left"}`}
                                        >
                                            {formatTime(message.timestamp)} • {message.sender === "user" ? "You" : "Admin"}
                                        </div>
                                    </div>

                                    {message.sender === "user" && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 order-1">
                                            <img
                                                src={registeredUser?.personalDetails?.photoURL || "/placeholder.svg"}
                                                alt={registeredUser?.displayName || "User"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
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
                                disabled={newMessage.trim() === ""}
                                className={`absolute right-2 bottom-2 p-2 rounded-full cursor-pointer ${
                                    newMessage.trim() === ""
                                        ? darkMode
                                            ? "text-gray-500"
                                            : "text-gray-300"
                                        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600"
                                }`}
                                aria-label="Send message"
                            >
                                <FiSend size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to the bottom button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className={`fixed bottom-24 right-8 p-3 rounded-full shadow-lg cursor-pointer ${
                        darkMode ? "bg-gray-700 text-blue-400 hover:bg-gray-600" : "bg-white text-blue-500 hover:bg-gray-50"
                    }`}
                    aria-label="Scroll to bottom"
                >
                    <FiChevronDown size={24} />
                </button>
            )}
        </div>
    )
}

export default UserMessagesComponent;
