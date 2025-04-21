import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { format } from "date-fns"
import { FaFileInvoiceDollar, FaDownload, FaBuilding, FaPhone, FaEnvelope, FaGlobe, FaCreditCard, FaCheckCircle, FaPrint, FaSpinner, FaShippingFast, FaShieldAlt, FaCalendarAlt, FaInfoCircle, FaTags, FaCoins, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaCcStripe, FaMoneyBillWave, FaIdCard } from "react-icons/fa"
import {toast} from "react-toastify";


const GenerateAndDownloadInvoiceComponent = () => {

    const location = useLocation()
    const { fullRentalOrderObject } = location?.state || {}

    const darkMode = useSelector((state) => state.darkMode?.isDark) || false
    const [isLoading, setIsLoading] = useState(true)
    const [downloadingPdf, setDownloadingPdf] = useState(false)
    const [printingInvoice, setPrintingInvoice] = useState(false)
    const invoiceRef = useRef(null)


    // Use the provided rental details or fall back to sample data
    const rentalData = fullRentalOrderObject


    // Company information
    const companyInfo = {
        name: "GadgetSwap GmbH",
        address: "Berliner Allee 57, 64295 Darmstadt",
        phone: "+49 6151 16-0",
        email: "contact@gadgetswap.com",
        website: "www.gadgetswap.com",
        taxId: "DE123456789",
        vatId: "VAT-DE123456789",
    }


    // Format date to readable format
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy")
        } catch (error) {
            return dateString
        }
    }


    // Current date for invoice
    const currentDate = format(new Date(), "dd MMM yyyy")


    // Invoice number (using order_id or generating a unique one)
    const invoiceNumber = rentalData?.order_id || `INV-${Date.now().toString().slice(-8)}`


    // Get the current rental streak (the most recent rental period)
    const currentRental = rentalData?.rentalStreak?.[rentalData?.rentalStreak?.length - 1] || {}


    // Format insurance option name for display
    const formatInsuranceOption = (option) => {
        if (!option) return "None"
        return option.charAt(0).toUpperCase() + option.slice(1)
    }


    // Get payment method icon
    const getPaymentMethodIcon = (method) => {
        if (!method) return <FaCreditCard />

        const methodLower = method.toLowerCase()

        if (methodLower.includes("visa")) return <FaCcVisa />
        if (methodLower.includes("mastercard")) return <FaCcMastercard />
        if (methodLower.includes("amex")) return <FaCcAmex />
        if (methodLower.includes("paypal")) return <FaCcPaypal />
        if (methodLower.includes("stripe")) return <FaCcStripe />
        if (methodLower.includes("cash")) return <FaMoneyBillWave />

        return <FaCreditCard />
    }


    useEffect(() => {
        // Simulate loading the invoice data
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])


    // Handle download invoice as PDF
    const handleDownloadPdf = async () => {
        if (!invoiceRef.current) return

        toast.info('Download PDF feature need to be developed.')
        return

        try {
            setDownloadingPdf(true)

            // Create a clone of the invoice element to modify without affecting the display
            const element = invoiceRef.current

            // Save the original background color
            const originalBackground = element.style.backgroundColor

            // Temporarily set the background to white for PDF
            element.style.backgroundColor = "#ffffff"

            // Generate PDF using html2canvas and jsPDF
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            })

            // Restore original background
            element.style.backgroundColor = originalBackground

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const imgWidth = 210 // A4 width in mm
            const pageHeight = 297 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

            // If the image is longer than the page, add more pages
            let heightLeft = imgHeight
            let position = 0

            while (heightLeft > pageHeight) {
                position = heightLeft - pageHeight
                pdf.addPage()
                pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save(`GadgetSwap_Invoice_${invoiceNumber}.pdf`)
        } catch (error) {
            console.error("Error generating PDF:", error)
        } finally {
            setDownloadingPdf(false)
        }
    }


    // Handle print invoice
    const handlePrintInvoice = () => {
        if (!invoiceRef.current) return

        toast.info('Print Invoice feature need to be developed.')
        return

        try {
            setPrintingInvoice(true)

            const content = invoiceRef.current.innerHTML
            const printWindow = window.open("", "_blank")

            if (!printWindow) {
                alert("Please allow pop-ups to print the invoice.")
                setPrintingInvoice(false)
                return
            }

            printWindow.document.open()
            printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>GadgetSwap Invoice #${invoiceNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #000;
                background-color: #fff;
                padding: 20px;
                margin: 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f2f2f2;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .company-info, .invoice-info {
                margin-bottom: 20px;
              }
              .total-row {
                font-weight: bold;
                background-color: #f2f2f2;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `)

            printWindow.document.close()

            printWindow.onload = () => {
                printWindow.focus()
                printWindow.print()
                printWindow.onafterprint = () => {
                    printWindow.close()
                    setPrintingInvoice(false)
                }
            }
        } catch (error) {
            console.error("Error printing invoice:", error)
            setPrintingInvoice(false)
        }
    }


    if (isLoading) {
        return (
            <div
                className={`container mx-auto max-w-4xl p-8 flex flex-col items-center justify-center min-h-[60vh] ${
                    darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                }`}
            >
                <FaSpinner className="animate-spin text-4xl mb-4" />
                <h2 className="text-xl font-semibold">Generating Invoice...</h2>
            </div>
        )
    }


    return (
        <div
            className={`mx-auto rounded-xl ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
                    <FaFileInvoiceDollar className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                    Invoice #{invoiceNumber}
                </h1>

                <div className="flex space-x-3">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className={`px-4 py-2 rounded-md flex items-center cursor-pointer ${
                            darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                        } ${downloadingPdf ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {downloadingPdf ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <FaDownload className="mr-2" />
                                Download PDF
                            </>
                        )}
                    </button>

                    <button
                        onClick={handlePrintInvoice}
                        disabled={printingInvoice}
                        className={`px-4 py-2 rounded-md flex items-center cursor-pointer ${
                            darkMode ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-500 hover:bg-gray-600 text-white"
                        } ${printingInvoice ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {printingInvoice ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Printing...
                            </>
                        ) : (
                            <>
                                <FaPrint className="mr-2" />
                                Print Invoice
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div
                ref={invoiceRef}
                className={`border rounded-lg overflow-hidden shadow-lg ${
                    darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                }`}
            >
                {/* Invoice Header */}
                <div className={`p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <div className="flex flex-col md:flex-row justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
                            {/* Reordered invoice information */}
                            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Invoice #: {invoiceNumber}</p>
                            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                Order ID: {rentalData?.order_id}
                            </p>
                            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Date: {currentDate}</p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                            <h3 className="text-xl font-semibold">{companyInfo.name}</h3>
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                <p className="flex items-center justify-end mt-1">
                                    <FaBuilding className="mr-1" /> {companyInfo.address}
                                </p>
                                <p className="flex items-center justify-end mt-1">
                                    <FaPhone className="mr-1" /> {companyInfo.phone}
                                </p>
                                <p className="flex items-center justify-end mt-1">
                                    <FaEnvelope className="mr-1" /> {companyInfo.email}
                                </p>
                                <p className="flex items-center justify-end mt-1">
                                    <FaGlobe className="mr-1" /> {companyInfo.website}
                                </p>
                                {/* Moved Tax ID and VAT ID here */}
                                <p className="flex items-center justify-end mt-1">
                                    <FaIdCard className="mr-1" /> {companyInfo.taxId}
                                </p>
                                <p className="flex items-center justify-end mt-1">
                                    <FaIdCard className="mr-1" /> {companyInfo.vatId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To Section */}
                <div className={`p-6 border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-base font-light mb-2">Bill To:</h3>
                            <p className="font-medium">{rentalData?.customerDetails?.name}</p>
                            <p>{rentalData?.customerDetails?.billingAddress?.street}</p>
                            <p>
                                {rentalData?.customerDetails?.billingAddress?.zipCode}{" "}
                                {rentalData?.customerDetails?.billingAddress?.city}
                            </p>
                            <p>{rentalData?.customerDetails?.billingAddress?.country}</p>
                            <p className="mt-2">{rentalData?.customerDetails?.email}</p>
                            <p>{rentalData?.customerDetails?.phone}</p>
                        </div>

                        {/* Moved membership details here */}
                        <div>
                            <h3 className="text-base font-ligh mb-2">Membership Details:</h3>
                            <div className="flex items-center mb-2">
                                <FaTags className={`mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                                <span>Membership Tier: {rentalData?.customerDetails?.membershipTier}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <FaCoins className={`mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                                <span>Current Points: {rentalData?.customerDetails?.currentPoint}</span>
                            </div>

                            <h3 className="text-base font-light mt-4 mb-2">Status Details:</h3>
                            <div className="grid grid-cols-2 gap-x-2">
                                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rental Status:</p>
                                <p className="capitalize">{rentalData?.rentalStatus}</p>

                                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Shipment:</p>
                                <p className="capitalize">{rentalData?.shipmentStatus?.replace(/_/g, " ")}</p>

                                {/* Payment method with the appropriate icon */}
                                {/*<p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Payment Method:</p>
                                <p className="flex items-center">
                                    {getPaymentMethodIcon(currentRental?.paymentMethod)}
                                    <span className="ml-1">{currentRental?.paymentMethod}</span>
                                </p>*/}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Items - Updated as requested */}
                <div className={`p-6 border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                    <h3 className="text-lg font-semibold mb-4">Rental Items</h3>

                    {/* Main item details - removed duration and amount */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Item
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Daily Rate
                                </th>
                            </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-md object-cover"
                                                src={rentalData?.gadgetImage || "/placeholder.svg"}
                                                alt={rentalData?.gadgetName}
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{rentalData?.gadgetName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{rentalData?.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">€{currentRental?.perDayPrice?.toFixed(2)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Detailed rental information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div
                            className={`bg-opacity-50 rounded-lg p-4 text-sm border border-opacity-20 ${
                                darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                            }`}
                        >
                            <h4 className="font-semibold mb-2 flex items-center">
                                <FaCalendarAlt className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                                Rental Period Details
                            </h4>
                            <ul className="space-y-1 pl-6">
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Start Date:</span>
                                    <span>{formatDate(currentRental?.startDate)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>End Date:</span>
                                    <span>{formatDate(currentRental?.endDate)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Total Days:</span>
                                    <span>{currentRental?.rentalDuration} days</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Daily Rate:</span>
                                    <span>€{currentRental?.perDayPrice?.toFixed(2)}/day</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Total Rent:</span>
                                    <span>€{currentRental?.onlyRentAmount?.toFixed(2)}</span>
                                </li>
                            </ul>
                        </div>

                        <div
                            className={`bg-opacity-50 rounded-lg p-4 text-sm border border-opacity-20 ${
                                darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                            }`}
                        >
                            <h4 className="font-semibold mb-2 flex items-center">
                                <FaShieldAlt className={`mr-2 ${darkMode ? "text-green-400" : "text-green-600"}`} />
                                Insurance Details
                            </h4>
                            <ul className="space-y-1 pl-6">
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Insurance Plan:</span>
                                    <span>{formatInsuranceOption(currentRental?.insuranceOption)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Insurance Cost:</span>
                                    <span>€{currentRental?.onlyInsuranceAmount?.toFixed(2)}</span>
                                </li>
                                {/*<li className="flex justify-between">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Rent + Insurance:</span>
                                    <span>€{currentRental?.rentAndInsuranceAmount?.toFixed(2)}</span>
                                </li>*/}
                            </ul>
                        </div>
                    </div>

                    {/* Shipping information */}
                    <div
                        className={`rounded-lg p-4 text-sm border border-opacity-20 ${
                            darkMode ? "bg-gray-700 bg-opacity-50 border-gray-600" : "bg-gray-50 border-gray-300"
                        }`}
                    >
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaShippingFast className={`mr-2 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
                            Shipping Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="mb-1">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Shipping Status:</span>{" "}
                                    {rentalData?.shipmentStatus?.replace(/_/g, " ")}
                                </p>
                                <p>
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Shipping Cost:</span> €
                                    {currentRental?.onlyShippingAmount?.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1">
                                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Shipping Address:</span>
                                </p>
                                <p>{rentalData?.customerDetails?.billingAddress?.street},</p>
                                <p>
                                    {rentalData?.customerDetails?.billingAddress?.zipCode}{" "}
                                    {rentalData?.customerDetails?.billingAddress?.city},{" "}
                                    {rentalData?.customerDetails?.billingAddress?.country}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className={`p-6 border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="md:w-1/2 mb-6 md:mb-0">
                            <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                            <div className="flex items-center mb-2">
                                {getPaymentMethodIcon(currentRental?.paymentMethod)}
                                <span className="ml-2">Payment Method: {currentRental?.paymentMethod}</span>
                            </div>

                            {/* Loyalty points section */}
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2 flex items-center">
                                    <FaCoins className={`mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                                    Loyalty Program
                                </h4>

                                {currentRental?.pointsEarned > 0 && (
                                    <div
                                        className={`p-3 rounded-md flex items-start gap-2 text-sm ${
                                            darkMode
                                                ? "bg-green-900 bg-opacity-20 border border-green-700 border-opacity-20 text-green-400"
                                                : "bg-green-100 border border-green-300 text-green-800"
                                        }`}
                                    >
                                        <FaCheckCircle className="mt-0.5" />
                                        <div>
                                            <p className="font-medium">Loyalty Points Earned</p>
                                            <p>You've earned {currentRental?.pointsEarned} points with this rental!</p>
                                        </div>
                                    </div>
                                )}

                                {currentRental?.pointsRedeemed > 0 && (
                                    <div
                                        className={`mt-2 p-3 rounded-md flex items-start gap-2 text-sm ${
                                            darkMode
                                                ? "bg-blue-900 bg-opacity-20 border border-blue-700 border-opacity-20 text-blue-400"
                                                : "bg-blue-100 border border-blue-300 text-blue-800"
                                        }`}
                                    >
                                        <FaInfoCircle className="mt-0.5" />
                                        <div>
                                            <p className="font-medium">Loyalty Points Redeemed</p>
                                            <p>You've redeemed {currentRental?.pointsRedeemed} points for this rental!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:w-1/3">
                            <h3 className="text-lg font-semibold mb-2">Summary</h3>
                            <div className={`rounded-md p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                {/* Detailed price breakdown */}
                                <div className="flex justify-between mb-2">
                                    <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Base Rental:</span>
                                    <span>€{currentRental?.onlyRentAmount?.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between mb-2">
                                    <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Insurance ({formatInsuranceOption(currentRental?.insuranceOption)}):
                                    </span>
                                    <span>€{currentRental?.onlyInsuranceAmount?.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between mb-2">
                                    <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Shipping:</span>
                                    <span>€{currentRental?.onlyShippingAmount?.toFixed(2)}</span>
                                </div>

                                {currentRental?.discountApplied > 0 && (
                                    <div className="flex justify-between mb-2 text-green-600 dark:text-green-400">
                                        <span>Discount:</span>
                                        <span>-€{currentRental?.discountApplied?.toFixed(2)}</span>
                                    </div>
                                )}

                                {currentRental?.pointsRedeemed > 0 && (
                                    <div className="flex justify-between mb-2 text-green-600 dark:text-green-400">
                                        <span>Points Redeemed:</span>
                                        <span>-€{(currentRental?.pointsRedeemed / 100).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className={`border-t mt-2 pt-2 ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
                                    <div className="flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span>€{currentRental?.payableFinalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className={`p-6 border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                    <h3 className="text-sm font-semibold mb-2">Terms & Conditions</h3>
                    <ul className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} list-disc pl-5 space-y-1`}>
                        <li>Payment is due within 14 days of invoice date.</li>
                        <li>Late returns may incur additional charges as per rental agreement.</li>
                        <li>Damage beyond normal wear and tear will be charged according to our repair policy.</li>
                        <li>For returns and refunds, please contact our customer service within 24 hours of receiving the item.</li>
                    </ul>
                </div>

                {/* Footer */}
                <div
                    className={`p-6 border-t text-center text-sm ${darkMode ? "border-gray-600 text-gray-400" : "border-gray-200 text-gray-500"}`}
                >
                    <p>Thank you for choosing GadgetSwap for your rental needs!</p>
                    <p className="mt-1">For any questions regarding this invoice, please contact our customer support.</p>
                    <p className="mt-3 text-xs">Invoice generated on {currentDate}</p>
                </div>
            </div>
        </div>
    )
}

export default GenerateAndDownloadInvoiceComponent;
