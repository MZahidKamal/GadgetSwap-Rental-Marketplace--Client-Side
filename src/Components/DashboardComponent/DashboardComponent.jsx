import React, {useState, useEffect, useContext} from "react";
import {
    FiHome,
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiHeart,
    FiMessageSquare,
    FiSettings,
    FiLogOut,
    FiX,
    FiHelpCircle, FiCreditCard
} from "react-icons/fi";
import {useSelector} from "react-redux";
import LoadingSkeleton from "./LoadingSkeleton.jsx";
import AdminOverviewComponent from "./AdminComponents/AdminOverviewComponent.jsx";
import AdminUsersComponent from "./AdminComponents/AdminUsersComponent.jsx";
import AdminGadgetsComponent from "./AdminComponents/AdminGadgetsComponent.jsx";
import AdminRentalsComponent from "./AdminComponents/AdminRentalsComponent.jsx";
import AdminSettingsComponent from "./AdminComponents/AdminSettingsComponent.jsx";
import UserOverviewComponent from "./UserComponents/UserOverviewComponent.jsx";
import UserMyRentalsComponent from "./UserComponents/UserMyRentalsComponent.jsx";
import UserWishlistComponent from "./UserComponents/UserWishlistComponent.jsx";
import UserMessagesComponent from "./UserComponents/UserMessagesComponent.jsx";
import UserSettingsComponent from "./UserComponents/UserSettingsComponent.jsx";
import {Link, useNavigate} from "react-router-dom";
import AuthContext from "../../Providers/AuthContext.jsx";
import {FaCamera, FaGamepad, FaHeadphones, FaLaptop, FaMobileAlt, FaTabletAlt} from "react-icons/fa";
import UserLoyaltyAndRewardComponent from "./UserComponents/UserLoyaltyAndRewardComponent.jsx";


const DashboardComponent = () => {

    // State management
    const {signOutCurrentUser} = useContext(AuthContext);
    const darkMode = useSelector((state) => state.darkMode.isDark);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();


    // Mock user data - in a real app, this would come from authentication
    const [user, setUser] = useState({
        id: "user123",
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/placeholder.svg",
        // role: "admin",                    // Activate this line to see admin dashboard
        role: "user",                    // Activate this line to see user dashboard
        joinDate: "2023-01-15",
        verified: true,
        balance: 1250.75,
        loyaltyPoints: 450
    });


    // Mock data for dashboard
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalUsers: 1245,
            activeRentals: 78,
            totalGadgets: 342,
            totalRevenue: 28750.50,
            pendingReturns: 12,
            newMessages: 8,
            completedRentals: 156,
            wishlistedItems: 24
        },
        recentRentals: [
            {
                id: "rent001",
                gadgetName: "iPhone 15 Pro Max",
                gadgetImage: "/placeholder.svg",
                renterName: "Alice Johnson",
                startDate: "2023-11-10",
                endDate: "2023-11-17",
                status: "active",
                amount: 175.50
            },
            {
                id: "rent002",
                gadgetName: "MacBook Pro 16\"",
                gadgetImage: "/placeholder.svg",
                renterName: "Bob Smith",
                startDate: "2023-11-08",
                endDate: "2023-11-22",
                status: "active",
                amount: 349.99
            },
            {
                id: "rent003",
                gadgetName: "Sony A7 IV Camera",
                gadgetImage: "/placeholder.svg",
                renterName: "Carol White",
                startDate: "2023-11-05",
                endDate: "2023-11-12",
                status: "returned",
                amount: 210.00
            },
            {
                id: "rent004",
                gadgetName: "DJI Mavic 3 Pro",
                gadgetImage: "/placeholder.svg",
                renterName: "David Brown",
                startDate: "2023-11-01",
                endDate: "2023-11-08",
                status: "returned",
                amount: 280.00
            }
        ],
        wishlist: [
            {
                id: "wish001",
                name: "Canon EOS R5",
                image: "/placeholder.svg",
                category: "Cameras",
                dailyRate: 45.99,
                availability: "available",
                rating: 4.9
            },
            {
                id: "wish001",
                name: "Canon EOS R5",
                image: "/placeholder.svg",
                category: "Cameras",
                dailyRate: 45.99,
                availability: "available",
                rating: 4.9
            },
            {
                id: "wish002",
                name: "Steam Deck",
                image: "/placeholder.svg",
                category: "Gaming",
                dailyRate: 18.50,
                availability: "unavailable",
                rating: 4.7
            }
        ],
        recentMessages: [
            {
                id: "msg001",
                sender: "Support Team",
                avatar: "/placeholder.svg",
                message: "Your inquiry about the rental extension has been processed.",
                time: "2 hours ago",
                read: false
            },
            {
                id: "msg002",
                sender: "Alice Johnson",
                avatar: "/placeholder.svg",
                message: "I'd like to know if the MacBook is available next week?",
                time: "Yesterday",
                read: false
            }
        ],
        popularCategories: [
            { name: "Smartphones", count: 85, icon: <FaMobileAlt /> },
            { name: "Laptops", count: 64, icon: <FaLaptop /> },
            { name: "Tablets", count: 42, icon: <FaTabletAlt /> },
            { name: "Headphones", count: 38, icon: <FaHeadphones /> },
            { name: "Cameras", count: 35, icon: <FaCamera /> },
            { name: "Gaming", count: 30, icon: <FaGamepad /> }
        ],
        notifications: [
            {
                id: "notif001",
                type: "rental",
                message: "Your rental request for iPad Pro has been confirmed",
                time: "10 minutes ago"
            },
            {
                id: "notif002",
                type: "return",
                message: "Return reminder: Your Sony camera is due tomorrow",
                time: "2 hours ago"
            },
            {
                id: "notif003",
                type: "payment",
                message: "Payment of $175.50 was processed for your rental",
                time: "Yesterday"
            }
        ]
    });


    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);


    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };


    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };


    const handleSignOutClick = async () => {
        await signOutCurrentUser();
        navigate('/');
    };


    useEffect(() => {
        window.scrollTo({
            top: 0,
            // behavior: 'smooth'
        });
    }, []);


    const AdminLeftSidebarTabs = [
        {id: 'overview', name: 'Overview', icon: <FiHome className="mr-3" size={20} />},
        {id: 'users', name: 'Users', icon: <FiUsers className="mr-3" size={20} />},
        {id: 'gadgets', name: 'Gadgets', icon: <FiPackage className="mr-3" size={20} />},
        {id: 'rentals', name: 'Rentals', icon: <FiShoppingCart className="mr-3" size={20} />},
        {id: 'settings', name: 'Settings', icon: <FiSettings className="mr-3" size={20} />}
    ];


    const UserLeftSidebarTabs = [
        {id: 'overview', name: 'Overview', icon: <FiHome className="mr-3" size={20} />},
        {id: 'rentals', name: 'My Rentals', icon: <FiShoppingCart className="mr-3" size={20} />},
        {id: 'wishlist', name: 'Wishlist', icon: <FiHeart className="mr-3" size={20} />},
        {id: 'messages', name: 'Messages', icon: <FiMessageSquare className="mr-3" size={20} />},
        {id: 'loyalty_and_rewards', name: 'Loyalty & Rewards', icon: <FiCreditCard className="mr-3" size={20} />},
        {id: 'settings', name: 'Settings', icon: <FiSettings className="mr-3" size={20} />}
    ]


    // Render admin dashboard content
    const renderAdminDashboard = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminOverviewComponent></AdminOverviewComponent>;

            case 'users':
                return <AdminUsersComponent></AdminUsersComponent>;

            case 'gadgets':
                return <AdminGadgetsComponent></AdminGadgetsComponent>;

            case 'rentals':
                return <AdminRentalsComponent></AdminRentalsComponent>;

            case 'settings':
                return <AdminSettingsComponent></AdminSettingsComponent>;

            default:
                return (
                    <div className="flex justify-center items-center h-64">
                        <p>Select a tab from the sidebar to view content</p>
                    </div>
                );
        }
    };


    // Render user dashboard content
    const renderUserDashboard = () => {
        switch (activeTab) {
            case 'overview':
                return <UserOverviewComponent></UserOverviewComponent>;

            case 'rentals':
                return <UserMyRentalsComponent></UserMyRentalsComponent>;

            case 'wishlist':
                return <UserWishlistComponent></UserWishlistComponent>;

            case 'messages':
                return <UserMessagesComponent></UserMessagesComponent>;

            case 'loyalty_and_rewards':
                return <UserLoyaltyAndRewardComponent></UserLoyaltyAndRewardComponent>;

            case 'settings':
                return <UserSettingsComponent></UserSettingsComponent>;

            default:
                return (
                    <div className="flex justify-center items-center h-64">
                        <p>Select a tab from the sidebar to view content</p>
                    </div>
                );
        }
    };


    return (
        <div
            className={`min-h-[calc(100vh-421px)] transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className={`absolute inset-0 bg-black opacity-50`} onClick={toggleMobileMenu}></div>
                    <div
                        className={`absolute left-0 top-0 bottom-0 w-3/4 max-w-xs p-4 overflow-y-auto transition-transform transform ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        }`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">GadgetSwap</h2>
                            <button
                                onClick={toggleMobileMenu}
                                className={`border-4 p-2 rounded-full ${
                                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                                }`}
                                aria-label="Close menu"
                            >
                                <FiX size={24}/>
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <img src={user.avatar || "/placeholder.svg"} alt={user.name}
                                     className="w-10 h-10 rounded-full mr-3"/>
                                <div>
                                    <h3 className="font-medium">{user.name}</h3>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.role}</p>
                                </div>
                            </div>
                        </div>

                        <nav>
                            <ul className="space-y-2">
                                {user.role === 'admin' ? (
                                    // Admin Navigation
                                    <>
                                        {AdminLeftSidebarTabs.map(tab => (
                                            <li key={tab.id}>
                                                <button
                                                    onClick={() => handleTabChange(tab.id)}
                                                    className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                                                        activeTab === tab.id
                                                            ? darkMode
                                                                ? "bg-blue-900/30 text-blue-400"
                                                                : "bg-blue-50 text-blue-600"
                                                            : darkMode
                                                                ? "hover:bg-gray-700"
                                                                : "hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {tab.icon}
                                                    <span>{tab.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </>
                                ) : (
                                    // User Navigation
                                    <>
                                        {UserLeftSidebarTabs.map(tab => (
                                            <li key={tab.id}>
                                                <button
                                                    onClick={() => handleTabChange(tab.id)}
                                                    className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                                                        activeTab === tab.id
                                                            ? darkMode
                                                                ? "bg-blue-900/30 text-blue-400"
                                                                : "bg-blue-50 text-blue-600"
                                                            : darkMode
                                                                ? "hover:bg-gray-700"
                                                                : "hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {tab.icon}
                                                    <span>{tab.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </>
                                )}
                                <li>
                                    <button
                                        onClick={handleSignOutClick}
                                        className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                                            darkMode
                                                ? "hover:bg-gray-700 text-gray-400"
                                                : "hover:bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        <FiLogOut className="mr-3" size={20}/>
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}


            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 pt-32">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div
                            className={`sticky top-32 rounded-xl p-4 ${darkMode ? "bg-gray-800" : "bg-white shadow-sm"}`}>
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <img src={user.avatar || "/placeholder.svg"} alt={user.name}
                                         className="w-10 h-10 rounded-full mr-3"/>
                                    <div>
                                        <h3 className="text-lg font-bold">{user.name}</h3>
                                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.role}</p>
                                    </div>
                                </div>
                            </div>

                            <nav>
                                <ul className="space-y-1">
                                    {user.role === 'admin' ? (
                                        // Admin Navigation
                                        <>
                                            {AdminLeftSidebarTabs.map(tab => (
                                                <li key={tab.id}>
                                                    <button
                                                        onClick={() => handleTabChange(tab.id)}
                                                        className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                                                            activeTab === tab.id
                                                                ? darkMode
                                                                    ? "bg-blue-900/30 text-blue-400"
                                                                    : "bg-blue-50 text-blue-600"
                                                                : darkMode
                                                                    ? "hover:bg-gray-700"
                                                                    : "hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {tab.icon}
                                                        <span>{tab.name}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </>
                                    ) : (
                                        // User Navigation
                                        <>
                                            {UserLeftSidebarTabs.map(tab => (
                                                <li key={tab.id}>
                                                    <button
                                                        onClick={() => handleTabChange(tab.id)}
                                                        className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                                                            activeTab === tab.id
                                                                ? darkMode
                                                                    ? "bg-blue-900/30 text-blue-400"
                                                                    : "bg-blue-50 text-blue-600"
                                                                : darkMode
                                                                    ? "hover:bg-gray-700"
                                                                    : "hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {tab.icon}
                                                        <span>{tab.name}</span>
                                                        {tab.id === 'messages' && dashboardData.recentMessages.filter(m => !m.read).length > 0 && (
                                                            <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                                                                darkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                                                            }`}>
                                                            {dashboardData.recentMessages.filter(m => !m.read).length}
                                                        </span>
                                                        )}
                                                        {tab.id === 'wishlist' && dashboardData.wishlist.length > 0 && (
                                                            <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                                                                darkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                                                            }`}>
                                                            {dashboardData.wishlist.length}
                                                        </span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                    <li>
                                        <button
                                            onClick={handleSignOutClick}
                                            className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                                                darkMode
                                                    ? "hover:bg-gray-700 text-gray-400"
                                                    : "hover:bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            <FiLogOut className="mr-3" size={20}/>
                                            <span>Logout</span>
                                        </button>
                                    </li>
                                </ul>
                            </nav>

                            <div className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                                <div className="flex items-start">
                                    <FiHelpCircle
                                        className={`mt-1 mr-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                                        size={20}/>
                                    <div>
                                        <h4 className="font-medium text-sm">Need Help?</h4>
                                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            Contact our support team for assistance
                                        </p>
                                        <Link
                                            to={'/contact-us'}
                                            className={`mt-2 text-xs ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                            Get Support
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {isLoading ? (
                            <LoadingSkeleton></LoadingSkeleton>
                        ) : (
                            user.role === 'admin' ? renderAdminDashboard() : renderUserDashboard()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;
