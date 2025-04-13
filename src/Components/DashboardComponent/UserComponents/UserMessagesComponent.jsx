import { useState, useRef, useEffect, useContext } from "react"
import { FiSend, FiCalendar, FiChevronDown, FiInfo, FiFilter, FiClock } from "react-icons/fi"
import { useSelector } from "react-redux"
import AuthContext from "../../../Providers/AuthContext.jsx"


const UserMessagesComponent = () => {

    // State management
    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { user: registeredUser } = useContext(AuthContext)

    // Initial fake messages data
    const initialMessages = [
        {
            id: 1,
            sender: "user",
            text: "Hello, I'm interested in renting the MacBook Pro. Is it available next week?",
            timestamp: new Date("2023-11-01T09:30:00").getTime(),
            readByAdmin: true,
        },
        {
            id: 2,
            sender: "admin",
            text: "Hi Alex! Yes, the MacBook Pro is available for rent next week. When exactly do you need it?",
            timestamp: new Date("2023-11-01T09:35:00").getTime(),
            readByUser: true,
        },
        {
            id: 3,
            sender: "user",
            text: "Great! I need it from Monday to Friday. What's the total cost for 5 days?",
            timestamp: new Date("2023-11-01T09:40:00").getTime(),
            readByAdmin: true,
        },
        {
            id: 4,
            sender: "admin",
            text: "For 5 days, the total would be $175. That includes insurance and a charger. Would you like to proceed with the booking?",
            timestamp: new Date("2023-11-01T09:45:00").getTime(),
            readByUser: true,
        },
        {
            id: 5,
            sender: "user",
            text: "That sounds good. Yes, I'd like to proceed with the booking.",
            timestamp: new Date("2023-11-01T09:50:00").getTime(),
            readByAdmin: true,
        },
        {
            id: 6,
            sender: "admin",
            text: "Perfect! I've created a booking for you. You can pick up the MacBook Pro on Monday at our main location. Is there anything else you need?",
            timestamp: new Date("2023-11-01T09:55:00").getTime(),
            readByUser: true,
        },
        {
            id: 7,
            sender: "user",
            text: "No, that's all for now. Thank you for your help!",
            timestamp: new Date("2023-11-01T10:00:00").getTime(),
            readByAdmin: true,
        },
        {
            id: 8,
            sender: "admin",
            text: "You're welcome! If you have any other questions, feel free to ask. Have a great day!",
            timestamp: new Date("2023-11-01T10:05:00").getTime(),
            readByUser: true,
        },
        {
            id: 9,
            sender: "user",
            text: "Quick question - does the MacBook come with any software pre-installed?",
            timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).getTime(),
            readByAdmin: true,
        },
        {
            id: 10,
            sender: "admin",
            text: "Yes, it comes with macOS and basic software like Safari, Pages, Numbers, and Keynote. If you need any specific software, please let us know in advance.",
            timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 300000,
            readByUser: true,
        },
        {
            id: 11,
            sender: "user",
            text: "That's perfect. I'll see you on Monday!",
            timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 600000,
            readByAdmin: true,
        },
        {
            id: 12,
            sender: "admin",
            text: "Looking forward to it! We're open from 9 AM to 6 PM.",
            timestamp: new Date().getTime() - 3600000,
            readByUser: true,
        },
        {
            id: 13,
            sender: "user",
            text: "I'll be there around 10 AM. See you then!",
            timestamp: new Date().getTime() - 1800000,
            readByAdmin: true,
        },
    ]

    // States
    const [messages, setMessages] = useState(initialMessages)
    const [newMessage, setNewMessage] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [showAllMessages, setShowAllMessages] = useState(false)

    // Refs
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)


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


    // Check if message is from today
    const isToday = (timestamp) => {
        const today = new Date()
        const messageDate = new Date(timestamp)
        return (
            messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear()
        )
    }


    // Check if message is from yesterday
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


    // Get formatted date label
    const getDateLabel = (timestamp) => {
        if (isToday(timestamp)) return "Today"
        if (isYesterday(timestamp)) return "Yesterday"
        return formatDate(timestamp)
    }


    // Check if date should be displayed (first message of the day)
    const shouldDisplayDate = (message, index) => {
        if (index === 0) return true

        const prevMessage = messages[index - 1]
        const prevDate = new Date(prevMessage.timestamp).toLocaleDateString()
        const currentDate = new Date(message.timestamp).toLocaleDateString()

        return prevDate !== currentDate
    }


    // Scroll to bottom of messages container
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }


    // Handle sending a new message
    const handleSendMessage = () => {
        if (newMessage.trim() === "") return

        const newMsg = {
            id: messages.length + 1,
            sender: "user",
            text: newMessage,
            timestamp: new Date().getTime(),
            readByAdmin: false,
        }

        setMessages((prevMessages) => [...prevMessages, newMsg])
        setNewMessage("")

        // Log the user message to console
        console.log("User Message:", newMsg)

        // Simulate admin response after 1 second
        setTimeout(() => {
            const adminResponse = {
                id: messages.length + 2,
                sender: "admin",
                text: "Thanks for your message! Our team will get back to you shortly.",
                timestamp: new Date().getTime(),
                readByUser: false,
            }

            setMessages((prevMessages) => [...prevMessages, adminResponse])

            // Log the admin message to console
            console.log("Admin Response:", adminResponse)
        }, 1500)
    }


    // Handle key press in message input
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }


    // Handle date selection
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
        setShowAllMessages(false)

        // Find first message of selected date
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

        // Find first message of today
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


    // Filter messages by selected date
    const getFilteredMessages = () => {
        if (showAllMessages) return messages

        if (!selectedDate) return messages

        const selectedDateObj = new Date(selectedDate)
        const nextDay = new Date(selectedDate)
        nextDay.setDate(nextDay.getDate() + 1)

        return messages.filter((message) => {
            const messageDate = new Date(message.timestamp)
            return messageDate >= selectedDateObj && messageDate < nextDay
        })
    }


    // Scroll to bottom on initial load
    useEffect(() => {
        scrollToBottom()
    }, [])


    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])


    // Add scroll event listener
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
                        {showAllMessages ? messages.length : getFilteredMessages().length} messages
                        {showAllMessages ? " (all)" : ""}
                    </div>
                </div>

                {/* Messages List */}
                <div
                    ref={messagesContainerRef}
                    className="px-10 py-4 h-[calc(100vh-300px)] min-h-[400px] overflow-y-auto"
                    onScroll={handleScroll}
                >
                    {getFilteredMessages().length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <FiInfo size={48} className={`mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                            <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {showAllMessages ? "No messages found" : "No messages on this date"}
                            </p>
                        </div>
                    ) : (
                        getFilteredMessages().map((message, index) => (
                            <div key={message.id} className="message-item">
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

            {/* Scroll to bottom button */}
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
