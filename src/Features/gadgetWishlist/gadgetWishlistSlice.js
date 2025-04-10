import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "../../SharedUtilities/SharedUtilities.jsx";


const initialState = {
    wishlist: [],
    isLoading: false,
    isError: false,
    error: null,
};


export const addOrRemoveWishlistGadget = createAsyncThunk(
    "gadgetWishlist/addOrRemoveWishlistGadget",
    async ({ userEmail, gadgetId }, { rejectWithValue }) => {
        try {

            const response = await fetch(`${BASE_URL}/users/add_or_remove_a_gadget_id_to_or_from_wishlist`, {
                method: "PATCH", // Match backend
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail, gadgetId }),
            });
            const data = await response.json();

            if (data.status !== 200) throw new Error(data.message || "Failed to update wishlist");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const gadgetWishlistSlice = createSlice({
    name: "gadgetWishlist",
    initialState,
    extraReducers: (builder) => {
        builder.addCase(addOrRemoveWishlistGadget.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(addOrRemoveWishlistGadget.fulfilled, (state, action) => {
            state.wishlist = action.payload;
            state.isLoading = false;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(addOrRemoveWishlistGadget.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.error = action.payload; // Use rejectWithValue message
        });
    },
});


export default gadgetWishlistSlice.reducer;
