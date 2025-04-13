import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import useAxiosPublic from "../../CustomHooks/useAxiosPublic.jsx";


const initialState = {
    featuredGadgets: [],
    isLoading: false,
    isError: false,
    error: null,
}


export const fetchFeaturedGadgets = createAsyncThunk(
    'featuredGadgetsForHomePage/fetchFeaturedGadgets',
    async (rejectWithValue) => {
        try {
            const axiosPublic = useAxiosPublic();
            const response = await axiosPublic.get(`/gadgets/featured_gadgets_for_home_page`, {});
            if (response?.data?.status !== 200)
                throw new Error(response?.data?.message || "Failed to fetch gadget details");
            return response?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const featuredGadgetsForHomePageSlice = createSlice({
    name: 'featuredGadgetsForHomePage',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(fetchFeaturedGadgets.pending, (state) => {
            state.featuredGadgets = [];
            state.isLoading = true;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(fetchFeaturedGadgets.fulfilled, (state, action) => {
            state.featuredGadgets = action.payload;
            state.isLoading = false;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(fetchFeaturedGadgets.rejected, (state, action) => {
            state.featuredGadgets = [];
            state.isLoading = false;
            state.isError = true;
            state.error = action.payload;
        });
    }
})


export default featuredGadgetsForHomePageSlice.reducer;
