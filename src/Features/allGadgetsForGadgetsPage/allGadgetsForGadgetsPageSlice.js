import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import useAxiosPublic from "../../CustomHooks/useAxiosPublic.jsx";


const initialState = {
    allGadgets: [],
    isLoading: false,
    isError: false,
    error: null,
}


export const fetchAllGadgets = createAsyncThunk(
    'allGadgetsForGadgetsPage/fetchAllGadgets',
    async (rejectWithValue) => {
        try {
            const axiosPublic = useAxiosPublic();
            const response = await axiosPublic.get(`/gadgets/get_all_gadgets_for_gadgets_page`, {});
            if (response?.data?.status !== 200)
                throw new Error(response?.data?.message || "Failed to fetch all gadgets for gadgets page");
            return response?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const allGadgetsForGadgetsPageSlice = createSlice({
    name: 'allGadgetsForGadgetsPage',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(fetchAllGadgets.pending, (state) => {
            state.allGadgets = [];
            state.isLoading = true;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(fetchAllGadgets.fulfilled, (state, action) => {
            state.allGadgets = action.payload;
            state.isLoading = false;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(fetchAllGadgets.rejected, (state, action) => {
            state.allGadgets = [];
            state.isLoading = false;
            state.isError = true;
            state.error = action.payload;
        });
    }
})


export default allGadgetsForGadgetsPageSlice.reducer;
