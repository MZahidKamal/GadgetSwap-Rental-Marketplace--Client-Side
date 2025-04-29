import {configureStore} from "@reduxjs/toolkit";
import darkLightThemeReducer from "../Features/darkLightTheme/darkLightThemeSlice";

import featuredGadgetsForHomePageReducer from "../Features/featuredGadgetsForHomePage/featuredGadgetsForHomePageSlice";
import allGadgetsForGadgetsPageReducer from "../Features/allGadgetsForGadgetsPage/allGadgetsForGadgetsPageSlice.js";
import getGadgetDetailsByIdReducer from "../Features/getGadgetDetailsById/getGadgetDetailsByIdSlice.js";

import userProfileDetailsReducer from "../Features/userProfileDetails/userProfileDetailsSlice.js";
import gadgetWishlistReducer from "../Features/gadgetWishlist/gadgetWishlistSlice.js";
import userMessagesReducer from "../Features/userMessages/userMessagesSlice.js";
import userRentalOrdersReducer from "../Features/userRentalOrders/userRentalOrdersSlice.js";

import adminAllUsersReducer from "../Features/adminAllUsers/adminAllUsersSlice.js";
import adminMessagesReducer from "../Features/adminMessages/adminMessagesSlice.js";
import adminAllGadgetsReducer from "../Features/adminAllGadgets/adminAllGadgetsSlice.js";
import adminAllRentalOrdersReducer from "../Features/adminAllRentalOrders/adminAllRentalOrdersSlice.js";


const reduxStore = configureStore({
    reducer: {
        darkMode: darkLightThemeReducer,

        featuredGadgetsForHomePage: featuredGadgetsForHomePageReducer,
        allGadgetsForGadgetsPage: allGadgetsForGadgetsPageReducer,
        getGadgetDetailsById: getGadgetDetailsByIdReducer,

        userProfileDetails: userProfileDetailsReducer,
        gadgetWishlist: gadgetWishlistReducer,
        userMessages: userMessagesReducer,
        userRentalOrders: userRentalOrdersReducer,

        adminAllUsers: adminAllUsersReducer,
        adminMessages: adminMessagesReducer,
        adminAllGadgets: adminAllGadgetsReducer,
        adminAllRentalOrders: adminAllRentalOrdersReducer,
    },
});

export default reduxStore;
