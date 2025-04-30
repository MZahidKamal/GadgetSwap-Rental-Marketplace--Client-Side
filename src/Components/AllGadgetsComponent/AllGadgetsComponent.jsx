import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiSearch, FiChevronDown, FiStar, FiChevronLeft, FiChevronRight, FiX, FiSliders, FiGrid, FiList } from "react-icons/fi"
import { FaMobileAlt, FaLaptop, FaTabletAlt, FaHeadphones, FaCamera, FaGamepad, FaVolumeUp, FaVrCardboard, FaPlane, FaProjectDiagram, FaClock, FaWifi } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllGadgets } from "../../Features/allGadgetsForGadgetsPage/allGadgetsForGadgetsPageSlice.js"


const AllGadgetsComponent = () => {

    const darkMode = useSelector((state) => state.darkMode.isDark)
    const { allGadgets } = useSelector((state) => state.allGadgetsForGadgetsPage)
    const dispatch = useDispatch()

    const [searchTerm, setSearchTerm] = useState("")
    const [searchSuggestionsState, setSearchSuggestionsState] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sortOption, setSortOption] = useState("alphabetic")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
    const [viewMode, setViewMode] = useState("grid")
    const [isLoading, setIsLoading] = useState(true)
    const [gadgetsData, setGadgetsData] = useState([])
    const [filteredGadgets, setFilteredGadgets] = useState([])
    const [isFiltering, setIsFiltering] = useState(false)
    const navigate = useNavigate()


    // Categories with their icons
    const categories = [
        { name: "All", icon: <FiGrid className="mr-2" /> },
        { name: "Smartphones", icon: <FaMobileAlt className="mr-2 text-blue-500" /> },
        { name: "Laptops", icon: <FaLaptop className="mr-2 text-purple-500" /> },
        { name: "Tablets", icon: <FaTabletAlt className="mr-2 text-green-500" /> },
        { name: "Smartwatches", icon: <FaClock className="mr-2 text-pink-500" /> },
        { name: "Cameras", icon: <FaCamera className="mr-2 text-red-500" /> },
        { name: "Gaming", icon: <FaGamepad className="mr-2 text-indigo-500" /> },
        { name: "Audio", icon: <FaVolumeUp className="mr-2 text-yellow-500" /> },
        { name: "Headphones", icon: <FaHeadphones className="mr-2 text-cyan-500" /> },
        { name: "Speakers", icon: <FaVolumeUp className="mr-2 text-blue-500" /> },
        { name: "Wearables", icon: <FaWifi className="mr-2 text-lime-500" /> },
        { name: "VR", icon: <FaVrCardboard className="mr-2 text-orange-500" /> },
        { name: "Drones", icon: <FaPlane className="mr-2 text-teal-500" /> },
        { name: "Projectors", icon: <FaProjectDiagram className="mr-2 text-amber-500" /> },
    ]


    // Sorting options
    const sortOptions = [
        { value: "alphabetic", label: "Alphabetic (A-Z)" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
        { value: "popularity", label: "Popularity" },
    ]


    // Fetch gadgets on mount
    useEffect(() => {
        dispatch(fetchAllGadgets())
    }, [dispatch])


    // Fetch gadgets data
    useEffect(() => {
        const fetchGadgets = async () => {
            setIsLoading(true)
            setTimeout(() => {
                if (allGadgets?.length > 0) {
                    // console.log(allGadgets?.data);
                    setGadgetsData(allGadgets)
                    setFilteredGadgets(allGadgets)
                    setIsLoading(false)
                }
            }, 10)
        }
        fetchGadgets().then()
    }, [allGadgets])


    // Filter gadgets based on search term and selected category
    const filterGadgets = () => {
        return gadgetsData.filter((gadget) => {
            const matchesSearch =
                gadget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gadget.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === "All" || gadget.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }


    // Sort filtered gadgets
    const sortGadgets = (gadgets) => {
        switch (sortOption) {
            case "alphabetic":
                return [...gadgets].sort((a, b) => a.name.localeCompare(b.name))
            case "priceAsc":
                return [...gadgets].sort((a, b) => a.pricePerDay - b.pricePerDay)
            case "priceDesc":
                return [...gadgets].sort((a, b) => b.pricePerDay - a.pricePerDay)
            case "popularity":
                return [...gadgets].sort((a, b) => b.popularity - a.popularity)
            default:
                return gadgets
        }
    }


    // Filter and sort gadgets when dependencies change
    useEffect(() => {
        if (!isLoading && gadgetsData.length > 0) {
            setIsFiltering(true)

            const timer = setTimeout(() => {
                const filtered = filterGadgets()
                const sorted = sortGadgets(filtered)
                setFilteredGadgets(sorted)
                setCurrentPage(1)
                setIsFiltering(false)
            }, 10)

            return () => clearTimeout(timer)
        }
    }, [searchTerm, selectedCategory, sortOption])


    // Get current gadgets for pagination
    const getCurrentGadgets = () => {
        const indexOfLastItem = currentPage * itemsPerPage
        const indexOfFirstItem = indexOfLastItem - itemsPerPage

        return {
            currentGadgets: filteredGadgets.slice(indexOfFirstItem, indexOfLastItem),
            totalGadgets: filteredGadgets.length,
        }
    }


    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
        // Scroll to the top when changing page
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
    }

    // Handle sort change
    const handleSortChange = (option) => {
        setSortOption(option)
    }

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)

        // Show suggestions only if input has 2 or more characters
        if (value.length >= 2) {
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
            setSearchSuggestionsState([])
        }
    }


    // Debounce search term for suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 100)

        return () => clearTimeout(timer)
    }, [searchTerm])


    // Generate search suggestions based on debounced search term using useMemo for performance
    const memoizedSearchSuggestions = useMemo(() => {
        if (debouncedSearchTerm.length < 2 || !gadgetsData.length) {
            return []
        }

        try {
            // Sanitize and limit input
            const sanitizedSearchTerm = debouncedSearchTerm.slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

            // Create a case-insensitive regex for the search term
            const regex = new RegExp(sanitizedSearchTerm, "i")

            // Filter and score gadgets based on weighted matches
            return gadgetsData
                .map((gadget) => {
                    let score = 0

                    // Name match (the highest weight: 3)
                    if (regex.test(gadget.name)) {
                        score += 3
                    }

                    // Category/brand/model match (medium weight: 2)
                    if (regex.test(gadget.category)) {
                        score += 2
                    }

                    if (gadget.brand && regex.test(gadget.brand)) {
                        score += 2
                    }

                    if (gadget.model && regex.test(gadget.model)) {
                        score += 2
                    }

                    // Description match (the lowest weight: 1)
                    if (regex.test(gadget.description)) {
                        score += 1
                    }

                    // Truncate description to first 10 words
                    const truncatedDescription = gadget.description
                        ? gadget.description.split(" ").slice(0, 10).join(" ") +
                        (gadget.description.split(" ").length > 10 ? "..." : "")
                        : ""

                    return {
                        id: gadget.id,
                        name: gadget.name,
                        description: truncatedDescription,
                        category: gadget.category,
                        image: gadget.image,
                        score,
                    }
                })
                .filter((item) => item.score > 0) // Only keep items with matches
                .sort((a, b) => b.score - a.score) // Sort by score (highest first)
                .slice(0, 8) // Limit to 8 suggestions
        }
        catch (error) {
            // User-friendly error handling with toast
            toast.error("Error generating search suggestions")
            console.error("Error generating search suggestions:", error)
            return []
        }
    }, [debouncedSearchTerm, gadgetsData])


    // Update search suggestions state when memoized value changes
    useEffect(() => {
        setSearchSuggestionsState(memoizedSearchSuggestions)
    }, [memoizedSearchSuggestions])


    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.name)
        setShowSuggestions(false)
        // The existing search functionality will be triggered by the useEffect that watches searchTerm
    }


    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".search-container")) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])


    // Handle gadget card click
    const handleGadgetClick = (id) => {
        navigate(`/all-gadgets/gadget-details/${id}`)
    }


    // Toggle filter menu for mobile
    const toggleFilterMenu = () => {
        setIsFilterMenuOpen(!isFilterMenuOpen)
    }


    // Toggle view mode (grid/list)
    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid")
    }


    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const { totalGadgets } = getCurrentGadgets()
        const totalPages = Math.ceil(totalGadgets / itemsPerPage)
        const pageNumbers = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages are less than max pages to show
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // Always show the first page
            pageNumbers.push(1)

            // Calculate the start and end of middle pages
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)

            // Adjust if we're near the beginning
            if (currentPage <= 3) {
                endPage = Math.min(totalPages - 1, 4)
            }

            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 3)
            }

            // Add ellipsis after the first page if needed
            if (startPage > 2) {
                pageNumbers.push("...")
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i)
            }

            // Add ellipsis before the last page if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push("...")
            }

            // Always show the last page if there are pages
            if (totalPages > 1) {
                pageNumbers.push(totalPages)
            }
        }

        return { pageNumbers, totalPages }
    }


    // Render skeleton loader for cards
    const renderSkeletonCards = () => {
        return Array(itemsPerPage)
            .fill()
            .map((_, index) => (
                <div
                    key={`skeleton-${index}`}
                    className={`rounded-xl overflow-hidden animate-pulse ${darkMode ? "bg-gray-800" : "bg-white"}`}
                >
                    <div className="h-48 w-full bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                        <div className={`h-5 w-3/4 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                        <div className={`h-4 w-full rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                        <div className={`h-4 w-2/3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                        <div className="flex justify-between pt-2">
                            <div className={`h-4 w-16 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                            <div className={`h-4 w-20 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                        </div>
                    </div>
                </div>
            ))
    }


    // Render skeleton loader for the list view
    const renderSkeletonList = () => {
        return Array(itemsPerPage)
            .fill()
            .map((_, index) => (
                <div
                    key={`skeleton-list-${index}`}
                    className={`rounded-xl overflow-hidden animate-pulse ${darkMode ? "bg-gray-800" : "bg-white"}`}
                >
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 h-48 sm:h-auto bg-gray-700"></div>
                        <div className="sm:w-3/4 p-4 sm:p-6 space-y-3">
                            <div className={`h-5 w-3/4 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                            <div className={`h-4 w-full rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                            <div className={`h-4 w-2/3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                            <div className="flex justify-between pt-2">
                                <div className={`h-4 w-16 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                                <div className={`h-4 w-20 rounded ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))
    }


    useEffect(() => {
        window.scrollTo({
            top: 0,
            // behavior: 'smooth'
        })
    }, [])


    const { currentGadgets, totalGadgets } = getCurrentGadgets()
    const { pageNumbers, totalPages } = getPaginationNumbers()


    return (
        <div
            className={`min-h-screen py-8 pt-32 transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
        >
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                            darkMode
                                ? "bg-gray-800/70 text-blue-400 border border-gray-700/50"
                                : "bg-white/80 text-blue-600 border border-blue-100/50 shadow-sm"
                        } backdrop-blur-md`}
                    >
                        <FiSearch className="mr-2" />
                        <span>Find what you feel</span>
                    </div>

                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Explore Gadgets
                    </h2>
                    <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Discover the latest tech available for rent from the best gadget brands.
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div
                    className={`mb-8 p-4 rounded-xl transition-all duration-300 ${darkMode ? "bg-gray-800 shadow-lg shadow-gray-900/20" : "bg-white shadow-md shadow-gray-200/50"}`}
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input with Suggestions */}
                        <div className="flex-grow search-container relative">
                            <div
                                className={`relative rounded-lg overflow-hidden transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                            >
                                <input
                                    type="text"
                                    placeholder="Search gadgets..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className={`w-full py-3 px-4 pr-12 focus:outline-none transition-colors ${
                                        darkMode
                                            ? "bg-gray-700 text-white placeholder-gray-400"
                                            : "bg-gray-100 text-gray-900 placeholder-gray-500"
                                    }`}
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                    <FiSearch
                                        className={`transition-colors cursor-pointer ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        size={20}
                                    />
                                </div>
                            </div>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && searchSuggestionsState.length > 0 && (
                                <div
                                    className={`absolute z-10 w-full mt-1 rounded-lg overflow-hidden shadow-lg max-h-80 overflow-y-auto ${
                                        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                                    }`}
                                >
                                    {searchSuggestionsState.map((suggestion) => (
                                        <div
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className={`flex items-center p-3 cursor-pointer transition-colors ${
                                                darkMode
                                                    ? "hover:bg-gray-700 border-b border-gray-700"
                                                    : "hover:bg-gray-100 border-b border-gray-100"
                                            }`}
                                        >
                                            {suggestion.image && (
                                                <div className="w-12 h-12 mr-3 flex-shrink-0">
                                                    <img
                                                        src={suggestion.image || "/placeholder.svg"}
                                                        alt={suggestion.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-grow">
                                                <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                    {suggestion.name}
                                                </div>
                                                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                    {suggestion.category} • {suggestion.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown - Desktop */}
                        <div className="hidden lg:block min-w-[200px]">
                            <div className={`relative rounded-lg transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                <select
                                    value={sortOption}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className={`appearance-none w-full py-3 px-4 pr-10 rounded-lg focus:outline-none transition-colors cursor-pointer ${
                                        darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
                                    }`}
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <FiChevronDown
                                        className={`transition-colors ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        size={20}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* View Toggle and Filter Button - Mobile */}
                        <div className="flex lg:hidden gap-2">
                            <button
                                onClick={toggleViewMode}
                                className={`p-3 rounded-lg transition-colors ${
                                    darkMode
                                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
                            >
                                {viewMode === "grid" ? <FiList size={20} /> : <FiGrid size={20} />}
                            </button>

                            <button
                                onClick={toggleFilterMenu}
                                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                                    darkMode
                                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <FiSliders size={20} />
                                <span>Filter & Sort</span>
                            </button>
                        </div>

                        {/* View Toggle - Desktop */}
                        <div className="hidden lg:block">
                            <button
                                onClick={toggleViewMode}
                                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                                    darkMode
                                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
                            >
                                {viewMode === "grid" ? <FiList size={20} /> : <FiGrid size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filter Menu */}
                    {isFilterMenuOpen && (
                        <div
                            className={`mt-4 p-4 rounded-lg lg:hidden transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium">Filters & Sorting</h3>
                                <button onClick={toggleFilterMenu} className="transition-transform hover:rotate-90">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label
                                    className={`block mb-2 text-sm font-medium transition-colors ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                >
                                    Sort By
                                </label>
                                <select
                                    value={sortOption}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className={`w-full p-2 rounded-lg transition-colors ${
                                        darkMode
                                            ? "bg-gray-800 text-white border border-gray-700"
                                            : "bg-white text-gray-900 border border-gray-300"
                                    }`}
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    className={`block mb-2 text-sm font-medium transition-colors ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                >
                                    Categories
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.slice(0, 5).map((category) => (
                                        <button
                                            key={category.name}
                                            onClick={() => handleCategoryChange(category.name)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                                                selectedCategory === category.name
                                                    ? darkMode
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-600 text-white"
                                                    : darkMode
                                                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                        : "bg-white text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            <span className="flex items-center">
                                            {category.icon}
                                                {category.name}
                                            </span>
                                        </button>
                                    ))}
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className={`w-full p-2 mt-2 rounded-lg transition-colors ${
                                            darkMode
                                                ? "bg-gray-800 text-white border border-gray-700"
                                                : "bg-white text-gray-900 border border-gray-300"
                                        }`}
                                    >
                                        <option value="All">All Categories</option>
                                        {categories.slice(1).map((category) => (
                                            <option key={category.name} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Pills - Desktop */}
                <div className="hidden lg:flex mb-8 overflow-x-auto pb-2">
                    <div className="w-9/12 mx-auto flex flex-wrap gap-2 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => handleCategoryChange(category.name)}
                                className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                                    selectedCategory === category.name
                                        ? darkMode
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-600 text-white"
                                        : darkMode
                                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                            : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                                }`}
                            >
                                <span className="flex items-center">
                                {category.icon}
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count and Sort - Desktop */}
                <div className="mb-6 flex justify-between items-center">
                    <p className={`transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {isLoading
                            ? "Loading gadgets..."
                            : isFiltering
                                ? "Filtering gadgets..."
                                : `Showing ${currentGadgets.length} of ${totalGadgets} gadgets`}
                    </p>
                </div>

                {/* No Results Message */}
                {!isLoading && !isFiltering && currentGadgets.length === 0 && (
                    <div className={`text-center py-16 transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        <FiSearch className="mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-medium mb-2">No gadgets found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                )}

                {/* Gadgets Grid with Animation */}
                {viewMode === "grid" && (
                    <div
                        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 ${isFiltering ? "opacity-60" : "opacity-100"} transition-opacity duration-300`}
                    >
                        {isLoading
                            ? renderSkeletonCards()
                            : currentGadgets.map((gadget) => (
                                <div
                                    key={gadget.id}
                                    onClick={() => handleGadgetClick(gadget.id)}
                                    className={`rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                                        darkMode ? "bg-gray-800 hover:bg-gray-750 shadow-lg" : "bg-white hover:bg-gray-50 shadow-md"
                                    }`}
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={gadget.image || "/placeholder.svg"}
                                            alt={gadget.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                                darkMode ? "bg-gray-900/80 text-white" : "bg-white/80 text-gray-900"
                                            }`}
                                        >
                                            {gadget.category}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col h-44">
                                        <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                            {gadget.name}
                                        </h3>
                                        <p className={`grow text-sm mb-3 line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                            {gadget.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <FiStar className="text-yellow-500 mr-1" size={16} />
                                                <span className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                                                    {gadget.average_rating.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className={`text-lg font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                                ${gadget.pricePerDay.toFixed(2)}
                                                <span className="text-xs font-normal">/day</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Gadgets List with Animation */}
                {viewMode === "list" && (
                    <div
                        className={`flex flex-col gap-4 mb-8 ${isFiltering ? "opacity-60" : "opacity-100"} transition-opacity duration-300`}
                    >
                        {isLoading
                            ? renderSkeletonList()
                            : currentGadgets.map((gadget) => (
                                <div
                                    key={gadget.id}
                                    onClick={() => handleGadgetClick(gadget.id)}
                                    className={`rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                                        darkMode ? "bg-gray-800 hover:bg-gray-750 shadow-lg" : "bg-white hover:bg-gray-50 shadow-md"
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-1/4 h-48 sm:h-auto relative">
                                            <img
                                                src={gadget.image || "/placeholder.svg"}
                                                alt={gadget.name}
                                                className="w-full h-48 object-cover object-center"
                                            />
                                            <div
                                                className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                                    darkMode ? "bg-gray-900/80 text-white" : "bg-white/80 text-gray-900"
                                                }`}
                                            >
                                                {gadget.category}
                                            </div>
                                        </div>
                                        <div className="sm:w-3/4 p-4 sm:p-6 flex flex-col justify-around">
                                            <div>
                                                <h3
                                                    className={`text-xl font-medium mb-2 line-clamp-2 transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}
                                                >
                                                    {gadget.name}
                                                </h3>
                                                <p
                                                    className={`text-sm mb-4 line-clamp-3 transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                                                >
                                                    {gadget.description}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <FiStar className="text-yellow-500 mr-1" size={16} />
                                                    <span
                                                        className={`text-sm font-medium transition-colors ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                                                    >
                                                        {gadget.average_rating.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`text-xl font-bold transition-colors ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                                                >
                                                    ${gadget.pricePerDay.toFixed(2)}
                                                    <span className="text-sm font-normal">/day</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg mr-2 transition-colors cursor-pointer ${
                                    currentPage === 1
                                        ? darkMode
                                            ? "text-gray-600 cursor-not-allowed"
                                            : "text-gray-400 cursor-not-allowed"
                                        : darkMode
                                            ? "text-gray-300 hover:bg-gray-800"
                                            : "text-gray-700 hover:bg-gray-100"
                                }`}
                                aria-label="Previous page"
                            >
                                <FiChevronLeft size={20} />
                            </button>

                            <div className="flex space-x-1">
                                {pageNumbers.map((page, index) =>
                                    page === "..." ? (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className={`px-2 py-1 transition-colors ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        >
                                                ...
                                            </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 rounded-lg transition-all duration-300 cursor-pointer ${
                                                currentPage === page
                                                    ? darkMode
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-600 text-white"
                                                    : darkMode
                                                        ? "text-gray-300 hover:bg-gray-800"
                                                        : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ),
                                )}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg ml-2 transition-colors cursor-pointer ${
                                    currentPage === totalPages
                                        ? darkMode
                                            ? "text-gray-600 cursor-not-allowed"
                                            : "text-gray-400 cursor-not-allowed"
                                        : darkMode
                                            ? "text-gray-300 hover:bg-gray-800"
                                            : "text-gray-700 hover:bg-gray-100"
                                }`}
                                aria-label="Next page"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllGadgetsComponent;
