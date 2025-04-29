import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
    allGadgetsFullDetails: [],
    isLoading: false,
    isError: false,
    error: null,
};


export const getAllGadgetsFullDetailsForAdmin = createAsyncThunk(
    "adminAllGadgets/getAllGadgetsFullDetailsForAdmin",
    async ({ adminEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/gadgets/get_all_gadgets_with_full_details_for_admin`,
                { adminEmail }
            );
            const data = response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to get all gadgets with full details for admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while fetching all gadgets with full details for admin");
        }
    }
);


export const updateTheDetailsOfAGadgetByAdmin = createAsyncThunk(
    "adminAllGadgets/updateTheDetailsOfAGadgetByAdmin",
    async ({ adminEmail, updatedGadgetObject, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.patch(
                `/gadgets/update_the_details_of_a_gadget_by_admin`,
                { adminEmail, updatedGadgetObject }
            );
            const data = response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to update the details of a gadget by admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while updating the details of a gadget by admin");
        }
    }
);


export const addANewGadgetWithDetailsByAdmin = createAsyncThunk(
    "adminAllGadgets/addANewGadgetWithDetailsByAdmin",
    async ({ adminEmail, newGadgetDetailsObject, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/gadgets/add_new_gadget_with_details_by_admin`,
                { adminEmail, newGadgetDetailsObject }
            );
            const data = response.data;
            if (data.status !== 201) throw new Error(data.message || "Failed to add new gadget with details by admin.");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while adding new gadget with details by admin.");
        }
    }
);


const adminAllGadgetsSlice = createSlice({
    name: "adminAllGadgets",
    initialState,
    extraReducers: (builder) => {
        builder

            //To get all gadgets with full details for admin.
            .addCase(getAllGadgetsFullDetailsForAdmin.pending, (state) => {
                state.allGadgetsFullDetails = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllGadgetsFullDetailsForAdmin.fulfilled, (state, action) => {
                state.allGadgetsFullDetails = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllGadgetsFullDetailsForAdmin.rejected, (state, action) => {
                state.allGadgetsFullDetails = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })

            //To update the details of a gadget by admin.
            .addCase(updateTheDetailsOfAGadgetByAdmin.pending, (state) => {
                state.allGadgetsFullDetails = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(updateTheDetailsOfAGadgetByAdmin.fulfilled, (state, action) => {
                state.allGadgetsFullDetails = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(updateTheDetailsOfAGadgetByAdmin.rejected, (state, action) => {
                state.allGadgetsFullDetails = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })

            //To add a new gadget with details by admin.
            .addCase(addANewGadgetWithDetailsByAdmin.pending, (state) => {
                state.allGadgetsFullDetails = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(addANewGadgetWithDetailsByAdmin.fulfilled, (state, action) => {
                state.allGadgetsFullDetails = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(addANewGadgetWithDetailsByAdmin.rejected, (state, action) => {
                state.allGadgetsFullDetails = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })
    },
});


export default adminAllGadgetsSlice.reducer;
