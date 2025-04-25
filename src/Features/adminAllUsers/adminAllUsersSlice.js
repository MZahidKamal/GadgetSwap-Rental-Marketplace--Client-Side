import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
    allUsersFullDetails: [],
    isLoading: false,
    isError: false,
    error: null,
};


export const getAllUsersFullDetailsForAdmin = createAsyncThunk(
    "adminAllUsers/getAllUsersFullDetailsForAdmin",
    async ({ adminEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/users/get_full_details_of_all_users_for_admin`,
                { adminEmail }
            );
            const data = response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to get all user's full details for admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while fetching all user's full details for admin");
        }
    }
);


const adminAllUsersSlice = createSlice({
    name: "adminAllUsers",
    initialState,
    extraReducers: (builder) => {
        builder

            //To get all the messages from all user's message chain.
            .addCase(getAllUsersFullDetailsForAdmin.pending, (state) => {
                state.allUsersFullDetails = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllUsersFullDetailsForAdmin.fulfilled, (state, action) => {
                state.allUsersFullDetails = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllUsersFullDetailsForAdmin.rejected, (state, action) => {
                state.allUsersFullDetails = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })
    },
});

export default adminAllUsersSlice.reducer;
