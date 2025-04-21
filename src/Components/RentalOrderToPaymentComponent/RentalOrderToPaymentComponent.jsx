import { useContext, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FiCreditCard, FiCalendar, FiLock, FiUser, FiCheckCircle, FiLoader, FiMapPin, FiPhone, FiMail, FiChevronRight, FiDollarSign, FiPackage } from "react-icons/fi"
import { MdOutlineLocalShipping, MdOutlineSecurity } from "react-icons/md"
import { BsCalendarDate, BsPersonCircle } from "react-icons/bs"
import { RiSecurePaymentLine, RiMastercardFill, RiVisaLine, RiPaypalFill } from "react-icons/ri"
import { HiOutlineReceiptTax } from "react-icons/hi"
import { SiAmericanexpress } from "react-icons/si"
import { useLocation, useNavigate } from "react-router-dom"
import { addANewRentalOrderForThisUser } from "../../Features/userRentalOrders/userRentalOrdersSlice.js"
import useAxiosSecure from "../../CustomHooks/useAxiosSecure.jsx"
import AuthContext from "../../Providers/AuthContext.jsx"


const RentalOrderToPaymentComponent = () => {

    // Get dark mode from the Redux store
    const darkMode = useSelector((state) => state.darkMode?.isDark)
    const { user: registeredUser } = useContext(AuthContext)
    const dispatch = useDispatch()
    const axiosSecure = useAxiosSecure()

    const location = useLocation()
    const { newRentalOrderObj } = location?.state || {}

    // Extract required information
    const displayName = newRentalOrderObj?.customerDetails?.name
    const email = newRentalOrderObj?.customerDetails?.email
    const phone = newRentalOrderObj?.customerDetails?.phone
    const billingAddress = newRentalOrderObj?.customerDetails?.billingAddress
    const membershipTier = newRentalOrderObj?.customerDetails?.membershipTier

    const gadgetId = newRentalOrderObj?.gadget_id
    const order_id = newRentalOrderObj?.order_id
    const gadgetName = newRentalOrderObj?.gadgetName
    const gadgetImage = newRentalOrderObj?.gadgetImage
    const category = newRentalOrderObj?.category


    // Get the last rental streak object
    const rentalDetails = newRentalOrderObj?.rentalStreak?.[newRentalOrderObj?.rentalStreak?.length - 1] || {}


    // Payment method state
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("mastercard")

    // Form state
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        expiryDate: "",
        cvc: "",
        cardholderName: "",
    })


    // PayPal state
    const [paypalDetails, setPaypalDetails] = useState({
        email: "",
        password: "",
    })


    const [isProcessing, setIsProcessing] = useState(false)
    const [isPaymentComplete, setIsPaymentComplete] = useState(false)
    const [errors, setErrors] = useState({})
    const [activeSection, setActiveSection] = useState("payment") // payment or success
    const navigate = useNavigate()


    // Handle payment method change
    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method)
        setErrors({})
    }


    // Handle input changes for card details
    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Format card number with spaces
        if (name === "cardNumber") {
            const formattedValue = value
                .replace(/\s/g, "")
                .replace(/(\d{4})/g, "$1 ")
                .trim()
                .slice(0, 19)
            setCardDetails({ ...cardDetails, [name]: formattedValue })
        }
        // Format expiry date with slash
        else if (name === "expiryDate") {
            const formattedValue = value
                .replace(/\D/g, "")
                .replace(/(\d{2})(\d)/, "$1/$2")
                .slice(0, 5)
            setCardDetails({ ...cardDetails, [name]: formattedValue })
        }
        // Limit CVC to 3-4 digits
        else if (name === "cvc") {
            const formattedValue = value.replace(/\D/g, "").slice(0, 4)
            setCardDetails({ ...cardDetails, [name]: formattedValue })
        } else {
            setCardDetails({ ...cardDetails, [name]: value })
        }
    }


    // Handle input changes for PayPal
    const handlePaypalInputChange = (e) => {
        const { name, value } = e.target
        setPaypalDetails({ ...paypalDetails, [name]: value })
    }


    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (selectedPaymentMethod === "paypal") {
            if (!paypalDetails.email) {
                newErrors.paypalEmail = "PayPal email is required"
            }
            if (!paypalDetails.password) {
                newErrors.paypalPassword = "PayPal password is required"
            }
        } else {
            // Card validation for all card types
            if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, "").length < 16) {
                newErrors.cardNumber = "Valid card number is required"
            }

            if (!cardDetails.expiryDate || !cardDetails.expiryDate.includes("/")) {
                newErrors.expiryDate = "Valid expiry date is required"
            } else {
                const [month, year] = cardDetails.expiryDate.split("/")
                const currentYear = new Date().getFullYear() % 100
                const currentMonth = new Date().getMonth() + 1

                if (
                    Number.parseInt(year) < currentYear ||
                    (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
                ) {
                    newErrors.expiryDate = "Card has expired"
                }
            }

            if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
                newErrors.cvc = "Valid CVC is required"
            }

            if (!cardDetails.cardholderName) {
                newErrors.cardholderName = "Cardholder name is required"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!registeredUser) {
            navigate("/sign-in")
            return
        }

        setIsProcessing(true)

        if (!validateForm()) {
            setIsProcessing(false)
            return
        }

        // Set a payment method based on selection
        let paymentMethodText = "Credit Card"

        switch (selectedPaymentMethod) {
            case "mastercard":
                paymentMethodText = "MasterCard"
                break
            case "visa":
                paymentMethodText = "Visa Card"
                break
            case "amex":
                paymentMethodText = "Amex Card"
                break
            case "paypal":
                paymentMethodText = "PayPal"
                break
            default:
                paymentMethodText = "Credit Card"
        }

        // Update payment method
        if (newRentalOrderObj?.rentalStreak && newRentalOrderObj.rentalStreak.length > 0) {
            newRentalOrderObj.rentalStreak[newRentalOrderObj.rentalStreak.length - 1].paymentMethod = paymentMethodText
        }

        // Dispatch action to add rental order
        // console.log(newRentalOrderObj);
        await dispatch(addANewRentalOrderForThisUser({userEmail: registeredUser?.email, gadgetId, newRentalOrderObj, axiosSecure}))

        // Navigate after showing success for 3 seconds
        setTimeout(() => {
            // Show the success state
            setIsPaymentComplete(true)
            setActiveSection("success")
            setIsProcessing(false)
        }, 3000)
    }


    // Payment method options
    const paymentMethods = [
        {
            id: "mastercard",
            name: "MasterCard",
            icon: <RiMastercardFill className={`text-xl ${darkMode ? "text-blue-300" : "text-blue-600"}`} />,
        },
        {
            id: "visa",
            name: "Visa Card",
            icon: <RiVisaLine className={`text-xl ${darkMode ? "text-blue-300" : "text-blue-600"}`} />,
        },
        {
            id: "amex",
            name: "Amex Card",
            icon: <SiAmericanexpress className={`text-xl ${darkMode ? "text-blue-300" : "text-blue-600"}`} />,
        },
        {
            id: "paypal",
            name: "PayPal",
            icon: <RiPaypalFill className={`text-xl ${darkMode ? "text-blue-300" : "text-blue-600"}`} />,
        },
    ]


    return (
        <div
            className={`min-h-[calc(100vh-421px)] ${
                darkMode
                    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
                    : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800"
            }`}
        >
            <div className="container mx-auto px-3 py-32 max-w-5xl">
                {/* Header with logo and order info */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                        {/* GadgetSwap Logo */}
                        <div className="mr-2">
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transform transition-transform duration-300 hover:scale-105"
                            >
                                <rect width="48" height="48" rx="12" fill={darkMode ? "#1E40AF" : "#2563EB"} />
                                <path
                                    d="M14 18C14 15.7909 15.7909 14 18 14H30C32.2091 14 34 15.7909 34 18V30C34 32.2091 32.2091 34 30 34H18C15.7909 34 14 32.2091 14 30V18Z"
                                    fill={darkMode ? "#93C5FD" : "#DBEAFE"}
                                />
                                <path
                                    d="M24 16L28 20H20L24 16Z"
                                    fill={darkMode ? "#1E40AF" : "#2563EB"}
                                    className="transform origin-center transition-transform duration-500 animate-pulse"
                                />
                                <path
                                    d="M24 32L20 28H28L24 32Z"
                                    fill={darkMode ? "#1E40AF" : "#2563EB"}
                                    className="transform origin-center transition-transform duration-500 animate-pulse"
                                />
                                <path
                                    d="M16 24L20 20V28L16 24Z"
                                    fill={darkMode ? "#1E40AF" : "#2563EB"}
                                    className="transform origin-center transition-transform duration-500 animate-pulse"
                                />
                                <path
                                    d="M32 24L28 28V20L32 24Z"
                                    fill={darkMode ? "#1E40AF" : "#2563EB"}
                                    className="transform origin-center transition-transform duration-500 animate-pulse"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                                GadgetSwap
                            </h1>
                            <p className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`}>Rental Payment</p>
                        </div>
                    </div>
                    <div
                        className={`px-3 py-2 rounded-lg ${
                            darkMode
                                ? "bg-gray-800/70 backdrop-blur-sm border border-gray-700"
                                : "bg-white/70 backdrop-blur-sm shadow-sm border border-gray-100"
                        }`}
                    >
                        <p className="text-xs font-medium">Order ID</p>
                        <p
                            className={`text-sm font-mono ${
                                darkMode ? "text-blue-300" : "text-blue-600"
                            } tracking-wide animate-pulse`}
                        >
                            {order_id}
                        </p>
                    </div>
                </div>

                {/* Main content */}
                <div className="space-y-4">
                    {/* Order Summary and Customer Info in a 2-column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Summary */}
                        <div
                            className={`rounded-xl overflow-hidden ${
                                darkMode
                                    ? "bg-gray-800/70 backdrop-blur-sm border border-gray-700"
                                    : "bg-white/70 backdrop-blur-sm shadow-md border border-gray-100"
                            } transition-all duration-300 hover:shadow-lg`}
                        >
                            <div
                                className={`px-4 py-2 ${
                                    darkMode
                                        ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b border-gray-700"
                                        : "bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-200"
                                }`}
                            >
                                <h2 className="text-base font-semibold">Order Summary</h2>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`w-16 h-16 rounded-lg overflow-hidden ${
                                                darkMode ? "bg-gray-700" : "bg-gray-100"
                                            } transition-transform duration-300 hover:scale-105 shadow-md`}
                                        >
                                            <img
                                                src={gadgetImage || "/placeholder.svg"}
                                                alt={gadgetName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-sm md:text-base">{gadgetName}</h3>
                                                <p
                                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                                        darkMode ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {category}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <FiDollarSign className={`text-xs mr-1 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                                <p className="text-sm font-semibold">${rentalDetails?.payableFinalAmount?.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex items-center">
                                                <div className="w-5 flex-shrink-0">
                                                    <BsCalendarDate className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                                </div>
                                                <div className="flex justify-between w-full">
                                                    <span className="text-xs md:text-sm font-medium">Rental Period:</span>
                                                    <span className="text-xs md:text-sm">
                                                        {rentalDetails?.startDate} - {rentalDetails?.endDate}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-5 flex-shrink-0">
                                                    <FiCalendar className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                                </div>
                                                <div className="flex justify-between w-full">
                                                    <span className="text-xs md:text-sm font-medium">Duration:</span>
                                                    <span className="text-xs md:text-sm">{rentalDetails?.rentalDuration} days</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-5 flex-shrink-0">
                                                    <MdOutlineSecurity className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                                </div>
                                                <div className="flex justify-between w-full">
                                                    <span className="text-xs md:text-sm font-medium">Insurance:</span>
                                                    <span className="text-xs md:text-sm">
                                                    {rentalDetails?.insuranceOption?.charAt(0).toUpperCase() +
                                                        rentalDetails?.insuranceOption?.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-5 flex-shrink-0">
                                                    <MdOutlineLocalShipping
                                                        className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`}
                                                    />
                                                </div>
                                                <div className="flex justify-between w-full">
                                                    <span className="text-xs md:text-sm font-medium">Shipping:</span>
                                                    <span className="text-xs md:text-sm">Standard Delivery</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div
                            className={`rounded-xl overflow-hidden ${
                                darkMode
                                    ? "bg-gray-800/70 backdrop-blur-sm border border-gray-700"
                                    : "bg-white/70 backdrop-blur-sm shadow-md border border-gray-100"
                            } transition-all duration-300 hover:shadow-lg`}
                        >
                            <div
                                className={`px-4 py-2 ${
                                    darkMode
                                        ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b border-gray-700"
                                        : "bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-200"
                                }`}
                            >
                                <h2 className="text-base font-semibold">Customer Information</h2>
                            </div>
                            <div className="p-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center">
                                        <div className="w-5 flex-shrink-0">
                                            <BsPersonCircle className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-xs md:text-sm font-medium">Name:</span>
                                            <span className="text-xs md:text-sm">{displayName}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-5 flex-shrink-0">
                                            <FiMail className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-xs md:text-sm font-medium">Email:</span>
                                            <span className="text-xs md:text-sm">{email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-5 flex-shrink-0">
                                            <FiPhone className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-xs md:text-sm font-medium">Phone:</span>
                                            <span className="text-xs md:text-sm">{phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-5 flex-shrink-0 mt-0.5">
                                            <FiMapPin className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-xs md:text-sm font-medium">Address:</span>
                                            <span className="text-xs md:text-sm text-right">
                                            {billingAddress?.street}, {billingAddress?.city}, {billingAddress?.state}{" "}
                                                {billingAddress?.zipCode}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <div className="w-5 flex-shrink-0">
                                            <FiUser
                                                className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`}/>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-xs md:text-sm font-medium">Membership:</span>
                                            <span
                                                className={`text-xs md:text-sm ${darkMode ? "text-blue-300" : "text-blue-600"} font-medium`}
                                            >
                                    {membershipTier} Tier
                                    </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div
                        className={`rounded-xl overflow-hidden ${
                            darkMode
                                ? "bg-gray-800/70 backdrop-blur-sm border border-gray-700"
                                : "bg-white/70 backdrop-blur-sm shadow-md border border-gray-100"
                        } transition-all duration-300 hover:shadow-lg`}
                    >
                        <div
                            className={`px-4 py-2 ${
                                darkMode
                                    ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b border-gray-700"
                                    : "bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-200"
                            }`}
                        >
                            <h2 className="text-base font-semibold">Payment Summary</h2>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2">
                                <div
                                    className={`flex items-center justify-between py-1.5 border-b ${
                                        darkMode ? "border-gray-700/50" : "border-gray-200/50"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <HiOutlineReceiptTax className={`text-xs mr-2 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        <p className="text-xs md:text-sm font-medium">Rental Base Price</p>
                                    </div>
                                    <p className="text-xs md:text-sm">${rentalDetails?.onlyRentAmount?.toFixed(2)}</p>
                                </div>

                                <div
                                    className={`flex items-center justify-between py-1.5 border-b ${
                                        darkMode ? "border-gray-700/50" : "border-gray-200/50"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <MdOutlineSecurity className={`text-xs mr-2 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        <p className="text-xs font-medium">Insurance ({rentalDetails?.insuranceOption})</p>
                                    </div>
                                    <p className="text-xs">${rentalDetails?.onlyInsuranceAmount?.toFixed(2)}</p>
                                </div>

                                <div
                                    className={`flex items-center justify-between py-1.5 border-b ${
                                        darkMode ? "border-gray-700/50" : "border-gray-200/50"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <MdOutlineLocalShipping
                                            className={`text-xs mr-2 ${darkMode ? "text-blue-300" : "text-blue-600"}`}
                                        />
                                        <p className="text-xs font-medium">Shipping</p>
                                    </div>
                                    <p className="text-xs">${rentalDetails?.onlyShippingAmount?.toFixed(2)}</p>
                                </div>

                                {rentalDetails?.discountApplied > 0 && (
                                    <div
                                        className={`flex items-center justify-between py-1.5 border-b ${
                                            darkMode ? "border-gray-700/50" : "border-gray-200/50"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <FiPackage className={`text-xs mr-2 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                            <p className="text-xs font-medium">Discount</p>
                                        </div>
                                        <p className={`text-xs ${darkMode ? "text-green-400" : "text-green-600"}`}>
                                            -${rentalDetails?.discountApplied?.toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                {rentalDetails?.pointsRedeemed > 0 && (
                                    <div
                                        className={`flex items-center justify-between py-1.5 border-b ${
                                            darkMode ? "border-gray-700/50" : "border-gray-200/50"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <FiPackage className={`text-xs mr-2 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                            <p className="text-xs font-medium">Points Redeemed</p>
                                        </div>
                                        <p className={`text-xs ${darkMode ? "text-green-400" : "text-green-600"}`}>
                                            -${(rentalDetails?.pointsRedeemed * 0.01).toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                <div
                                    className={`flex items-center justify-between py-2 mt-1 ${
                                        darkMode
                                            ? "bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg"
                                            : "bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg"
                                    }`}
                                >
                                    <div className="flex items-center ml-2">
                                        <FiDollarSign className={`text-sm mr-2 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        <p className="text-sm md:text-base font-semibold">Total</p>
                                    </div>
                                    <p className={`text-sm md:text-base font-bold ${darkMode ? "text-blue-300" : "text-blue-700"} mr-2`}>
                                        ${rentalDetails?.payableFinalAmount?.toFixed(2)}
                                    </p>
                                </div>

                                <div className="mt-1 text-center">
                                    <p className={`text-xs md:text-sm ${darkMode ? "text-green-400" : "text-green-600"} font-medium`}>
                                        You will earn {rentalDetails?.pointsEarned} points with this rental
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form or Success */}
                    {activeSection === "payment" && !isPaymentComplete ? (
                        <div
                            className={`rounded-xl overflow-hidden ${
                                darkMode
                                    ? "bg-gray-800/70 backdrop-blur-sm border border-gray-700"
                                    : "bg-white/70 backdrop-blur-sm shadow-md border border-gray-100"
                            } transition-all duration-300 hover:shadow-lg`}
                        >
                            <div
                                className={`px-4 py-2 ${
                                    darkMode
                                        ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b border-gray-700"
                                        : "bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-200"
                                }`}
                            >
                                <h2 className="text-base font-semibold">Payment Method</h2>
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Payment Method Selection */}
                                    <div className="mb-4">
                                        <p className="text-xs font-medium mb-2">Select Payment Method</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {paymentMethods.map((method) => (
                                                <div
                                                    key={method.id}
                                                    onClick={() => handlePaymentMethodChange(method.id)}
                                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                                        selectedPaymentMethod === method.id
                                                            ? darkMode
                                                                ? "bg-blue-900/30 border-2 border-blue-500"
                                                                : "bg-blue-50 border-2 border-blue-500"
                                                            : darkMode
                                                                ? "bg-gray-700/50 border-2 border-gray-700 hover:bg-gray-700"
                                                                : "bg-gray-100/50 border-2 border-gray-200 hover:bg-gray-200/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="mr-2">
                                                            <div
                                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                                    selectedPaymentMethod === method.id
                                                                        ? darkMode
                                                                            ? "border-blue-400"
                                                                            : "border-blue-600"
                                                                        : darkMode
                                                                            ? "border-gray-500"
                                                                            : "border-gray-400"
                                                                }`}
                                                            >
                                                                {selectedPaymentMethod === method.id && (
                                                                    <div
                                                                        className={`w-2 h-2 rounded-full ${darkMode ? "bg-blue-400" : "bg-blue-600"}`}
                                                                    ></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center">
                                                                {method.icon}
                                                                <span className="text-xs ml-1 font-medium">{method.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Payment Fields */}
                                    {selectedPaymentMethod !== "paypal" && (
                                        <>
                                            <div>
                                                <label htmlFor="cardholderName" className="block text-xs font-medium mb-1">
                                                    Cardholder Name
                                                </label>
                                                <div
                                                    className={`flex items-center border-2 rounded-lg ${
                                                        errors.cardholderName
                                                            ? "border-red-500"
                                                            : darkMode
                                                                ? "border-gray-600 focus-within:border-blue-400"
                                                                : "border-gray-300 focus-within:border-blue-500"
                                                    } ${darkMode ? "bg-gray-700" : "bg-white"} focus-within:ring-1 focus-within:ring-offset-0 ${
                                                        darkMode ? "focus-within:ring-blue-500/30" : "focus-within:ring-blue-400/30"
                                                    } transition-all duration-200`}
                                                >
                                                    <span className="pl-2">
                                                    <FiUser
                                                        className={`text-sm ${
                                                            errors.cardholderName ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                    />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="cardholderName"
                                                        name="cardholderName"
                                                        value={cardDetails.cardholderName}
                                                        onChange={handleInputChange}
                                                        placeholder="Your Name"
                                                        className={`w-full py-2 px-2 rounded-lg text-sm outline-none ${
                                                            darkMode
                                                                ? "bg-gray-700 text-white placeholder-gray-500"
                                                                : "bg-white text-gray-900 placeholder-gray-400"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.cardholderName && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FiChevronRight className="mr-1" size={10} />
                                                        {errors.cardholderName}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="cardNumber" className="block text-xs font-medium mb-1">
                                                    Card Number
                                                </label>
                                                <div
                                                    className={`flex items-center border-2 rounded-lg ${
                                                        errors.cardNumber
                                                            ? "border-red-500"
                                                            : darkMode
                                                                ? "border-gray-600 focus-within:border-blue-400"
                                                                : "border-gray-300 focus-within:border-blue-500"
                                                    } ${darkMode ? "bg-gray-700" : "bg-white"} focus-within:ring-1 focus-within:ring-offset-0 ${
                                                        darkMode ? "focus-within:ring-blue-500/30" : "focus-within:ring-blue-400/30"
                                                    } transition-all duration-200`}
                                                >
                                                    <span className="pl-2">
                                                    <FiCreditCard
                                                        className={`text-sm ${
                                                            errors.cardNumber ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                    />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="cardNumber"
                                                        name="cardNumber"
                                                        value={cardDetails.cardNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="4242 4242 4242 4242"
                                                        className={`w-full py-2 px-2 rounded-lg text-sm outline-none ${
                                                            darkMode
                                                                ? "bg-gray-700 text-white placeholder-gray-500"
                                                                : "bg-white text-gray-900 placeholder-gray-400"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.cardNumber && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FiChevronRight className="mr-1" size={10} />
                                                        {errors.cardNumber}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label htmlFor="expiryDate" className="block text-xs font-medium mb-1">
                                                        Expiry Date
                                                    </label>
                                                    <div
                                                        className={`flex items-center border-2 rounded-lg ${
                                                            errors.expiryDate
                                                                ? "border-red-500"
                                                                : darkMode
                                                                    ? "border-gray-600 focus-within:border-blue-400"
                                                                    : "border-gray-300 focus-within:border-blue-500"
                                                        } ${darkMode ? "bg-gray-700" : "bg-white"} focus-within:ring-1 focus-within:ring-offset-0 ${
                                                            darkMode ? "focus-within:ring-blue-500/30" : "focus-within:ring-blue-400/30"
                                                        } transition-all duration-200`}
                                                    >
                                                        <span className="pl-2">
                                                        <FiCalendar
                                                            className={`text-sm ${
                                                                errors.expiryDate ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
                                                            }`}
                                                        />
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="expiryDate"
                                                            name="expiryDate"
                                                            value={cardDetails.expiryDate}
                                                            onChange={handleInputChange}
                                                            placeholder="MM/YY"
                                                            className={`w-full py-2 px-2 rounded-lg text-sm outline-none ${
                                                                darkMode
                                                                    ? "bg-gray-700 text-white placeholder-gray-500"
                                                                    : "bg-white text-gray-900 placeholder-gray-400"
                                                            }`}
                                                        />
                                                    </div>
                                                    {errors.expiryDate && (
                                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                                            <FiChevronRight className="mr-1" size={10} />
                                                            {errors.expiryDate}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label htmlFor="cvc" className="block text-xs font-medium mb-1">
                                                        CVC
                                                    </label>
                                                    <div
                                                        className={`flex items-center border-2 rounded-lg ${
                                                            errors.cvc
                                                                ? "border-red-500"
                                                                : darkMode
                                                                    ? "border-gray-600 focus-within:border-blue-400"
                                                                    : "border-gray-300 focus-within:border-blue-500"
                                                        } ${darkMode ? "bg-gray-700" : "bg-white"} focus-within:ring-1 focus-within:ring-offset-0 ${
                                                            darkMode ? "focus-within:ring-blue-500/30" : "focus-within:ring-blue-400/30"
                                                        } transition-all duration-200`}
                                                    >
                                                        <span className="pl-2">
                                                        <FiLock
                                                            className={`text-sm ${
                                                                errors.cvc ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
                                                            }`}
                                                        />
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="cvc"
                                                            name="cvc"
                                                            value={cardDetails.cvc}
                                                            onChange={handleInputChange}
                                                            placeholder="123"
                                                            className={`w-full py-2 px-2 rounded-lg text-sm outline-none ${
                                                                darkMode
                                                                    ? "bg-gray-700 text-white placeholder-gray-500"
                                                                    : "bg-white text-gray-900 placeholder-gray-400"
                                                            }`}
                                                        />
                                                    </div>
                                                    {errors.cvc && (
                                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                                            <FiChevronRight className="mr-1" size={10} />
                                                            {errors.cvc}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* PayPal Fields */}
                                    {selectedPaymentMethod === "paypal" && (
                                        <>
                                            <div>
                                                <label htmlFor="paypalEmail" className="block text-xs font-medium mb-1">
                                                    PayPal Email
                                                </label>
                                                <div
                                                    className={`flex items-center border-2 rounded-lg ${
                                                        errors.paypalEmail
                                                            ? "border-red-500"
                                                            : darkMode
                                                                ? "border-gray-600 focus-within:border-blue-400"
                                                                : "border-gray-300 focus-within:border-blue-500"
                                                    } ${darkMode ? "bg-gray-700" : "bg-white"} focus-within:ring-1 focus-within:ring-offset-0 ${
                                                        darkMode ? "focus-within:ring-blue-500/30" : "focus-within:ring-blue-400/30"
                                                    } transition-all duration-200`}
                                                >
                                                    <span className="pl-2">
                                                    <FiMail
                                                        className={`text-sm ${
                                                            errors.paypalEmail ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                    />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        id="paypalEmail"
                                                        name="email"
                                                        value={paypalDetails.email}
                                                        onChange={handlePaypalInputChange}
                                                        placeholder="your-email@domain.com"
                                                        className={`w-full py-2 px-2 rounded-lg text-sm outline-none ${
                                                            darkMode
                                                                ? "bg-gray-700 text-white placeholder-gray-500"
                                                                : "bg-white text-gray-900 placeholder-gray-400"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.paypalEmail && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FiChevronRight className="mr-1" size={10} />
                                                        {errors.paypalEmail}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="paypalPassword" className="block text-xs font-medium mb-1">
                                                    PayPal Password
                                                </label>
                                                <div
                                                    className={`flex items-center border-2 rounded-lg ${
                                                        errors.paypalPassword
                                                            ? "border-red-500"
                                                            : darkMode
                                                                ? "border-gray-600 focus-within:border-blue-400"
                                                                : "border-gray-300 focus-within:border-blue-500"
                                                    } ${darkMode ? "bg-gray-700" : "bg-white"} focus-within:ring-1 focus-within:ring-offset-0 ${
                                                        darkMode ? "focus-within:ring-blue-500/30" : "focus-within:ring-blue-400/30"
                                                    } transition-all duration-200`}
                                                >
                                                    <span className="pl-2">
                                                    <FiLock
                                                        className={`text-sm ${
                                                            errors.paypalPassword ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                    />
                                                    </span>
                                                    <input
                                                        type="password"
                                                        id="paypalPassword"
                                                        name="password"
                                                        value={paypalDetails.password}
                                                        onChange={handlePaypalInputChange}
                                                        placeholder="••••••••"
                                                        className={`w-full py-2 px-2 rounded-lg text-sm outline-none ${
                                                            darkMode
                                                                ? "bg-gray-700 text-white placeholder-gray-500"
                                                                : "bg-white text-gray-900 placeholder-gray-400"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.paypalPassword && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FiChevronRight className="mr-1" size={10} />
                                                        {errors.paypalPassword}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div
                                        className={`flex items-center p-2 rounded-lg mt-2 text-xs ${
                                            darkMode
                                                ? "bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-900/30"
                                                : "bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-100"
                                        }`}
                                    >
                                        <RiSecurePaymentLine className={`text-xs mr-1.5 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                                        <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            Your payment information is secure and encrypted
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className={`w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                            isProcessing ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center justify-center">
                                                <FiLoader className="animate-spin mr-2" size={14}/>
                                                Processing...
                                            </span>
                                        ) : (
                                            `Pay $${rentalDetails?.payableFinalAmount?.toFixed(2)}`
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`rounded-xl overflow-hidden ${
                                darkMode
                                    ? "bg-gray-800/70 backdrop-blur-sm border border-gray-700"
                                    : "bg-white/70 backdrop-blur-sm shadow-md border border-gray-100"
                            } transition-all duration-300 hover:shadow-lg`}
                        >
                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                            darkMode
                                                ? "bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30"
                                                : "bg-gradient-to-br from-green-100 to-blue-100 border border-green-200"
                                        }`}
                                    >
                                        <FiCheckCircle
                                            className={`text-3xl ${darkMode ? "text-green-400" : "text-green-600"} animate-pulse`}
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
                                        Payment Successful!
                                    </h2>
                                    <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-4 text-center max-w-md text-sm`}>
                                        Your rental order has been confirmed and is being processed.
                                    </p>
                                    <div
                                        className={`px-4 py-2 rounded-lg mb-4 font-mono ${
                                            darkMode
                                                ? "bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-900/30"
                                                : "bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-100"
                                        }`}
                                    >
                                        <p className="font-medium text-sm">Order ID: {order_id}</p>
                                    </div>
                                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-center text-xs`}>
                                        A confirmation email has been sent to{" "}
                                        <span className={`font-semibold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>{email}</span>
                                    </p>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => navigate("/dashboard/user/my_rentals")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                                darkMode
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                    : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                                            } transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
                                        >
                                            Track Your Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={`mt-4 pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"} text-center`} />
                    <div className="flex justify-center items-center mb-2">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1"
                        >
                            <rect width="48" height="48" rx="12" fill={darkMode ? "#1E40AF" : "#2563EB"} />
                            <path
                                d="M14 18C14 15.7909 15.7909 14 18 14H30C32.2091 14 34 15.7909 34 18V30C34 32.2091 32.2091 34 30 34H18C15.7909 34 14 32.2091 14 30V18Z"
                                fill={darkMode ? "#93C5FD" : "#DBEAFE"}
                            />
                            <path d="M24 16L28 20H20L24 16Z" fill={darkMode ? "#1E40AF" : "#2563EB"} />
                            <path d="M24 32L20 28H28L24 32Z" fill={darkMode ? "#1E40AF" : "#2563EB"} />
                            <path d="M16 24L20 20V28L16 24Z" fill={darkMode ? "#1E40AF" : "#2563EB"} />
                            <path d="M32 24L28 28V20L32 24Z" fill={darkMode ? "#1E40AF" : "#2563EB"} />
                        </svg>
                        <p
                            className={`text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400`}
                        >
                            GadgetSwap
                        </p>
                    </div>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>
                        Thank you for choosing GadgetSwap for your rental needs.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RentalOrderToPaymentComponent;
