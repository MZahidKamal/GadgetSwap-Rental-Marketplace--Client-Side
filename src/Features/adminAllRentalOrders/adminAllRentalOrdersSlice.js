import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
    allRentalOrdersDellDetails: [],
    isLoading: false,
    isError: false,
    error: null,
};


export const getAllRentalOrdersOfAllUsersForAdmin = createAsyncThunk(
    "adminAllRentalOrders/getAllRentalOrdersOfAllUsersForAdmin",
    async ({ adminEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/rental_orders/get_full_details_of_all_rental_orders_for_admin`,
                { adminEmail }
            );
            const data = response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to get all rental orders of all users for admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while fetching all rental orders of all users for admin");
        }
    }
);


export const updateTheDetailsOfARentalOrderByAdmin = createAsyncThunk(
    "adminAllRentalOrders/updateTheDetailsOfARentalOrderByAdmin",
    async ({ adminEmail, updatedRentalOrderObj, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.patch(
                `/rental_orders/update_the_details_of_a_rental_orders_by_admin`,
                { adminEmail, updatedRentalOrderObj }
            );
            const data = response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to update the details of a rental order by admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while updating the details of a rental order by admin");
        }
    }
);


const adminAllRentalOrdersSlice = createSlice({
    name: "adminAllRentalOrders",
    initialState,
    extraReducers: (builder) => {
        builder

            //To get all the rental orders from all users.
            .addCase(getAllRentalOrdersOfAllUsersForAdmin.pending, (state) => {
                state.allRentalOrdersDellDetails = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllRentalOrdersOfAllUsersForAdmin.fulfilled, (state, action) => {
                state.allRentalOrdersDellDetails = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllRentalOrdersOfAllUsersForAdmin.rejected, (state, action) => {
                state.allRentalOrdersDellDetails = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })

            //To update the details of a rental order by admin.
            .addCase(updateTheDetailsOfARentalOrderByAdmin.pending, (state) => {
                state.allRentalOrdersDellDetails = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(updateTheDetailsOfARentalOrderByAdmin.fulfilled, (state, action) => {
                state.allRentalOrdersDellDetails = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(updateTheDetailsOfARentalOrderByAdmin.rejected, (state, action) => {
                state.allRentalOrdersDellDetails = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })
    },
});


export default adminAllRentalOrdersSlice.reducer;
