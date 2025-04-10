import {configureStore} from "@reduxjs/toolkit";
import darkLightThemeReducer from "../Features/darkLightTheme/darkLightThemeSlice";
import featuredGadgetsForHomePageReducer from "../Features/featuredGadgetsForHomePage/featuredGadgetsForHomePageSlice";
import allGadgetsForGadgetsPageReducer from "../Features/allGadgetsForGadgetsPage/allGadgetsForGadgetsPageSlice.js";
import getGadgetDetailsByIdReducer from "../Features/getGadgetDetailsById/getGadgetDetailsByIdSlice.js";
import gadgetWishlistReducer from "../Features/gadgetWishlist/gadgetWishlistSlice.js";


const reduxStore = configureStore({
    reducer: {
        darkMode: darkLightThemeReducer,
        featuredGadgetsForHomePage: featuredGadgetsForHomePageReducer,
        allGadgetsForGadgetsPage: allGadgetsForGadgetsPageReducer,
        getGadgetDetailsById: getGadgetDetailsByIdReducer,
        gadgetWishlist: gadgetWishlistReducer,
    },
});

export default reduxStore;
