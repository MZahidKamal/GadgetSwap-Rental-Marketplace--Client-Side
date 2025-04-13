import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
    userProfileDetails: {},
    isLoading: false,
    isError: false,
    error: null,
};


export const getUserProfileDetails = createAsyncThunk(
    "userProfileDetails/getUserProfileDetails",
    async ({userEmail, axiosSecure}, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/users/get_full_user_profile_details`,
                { userEmail }
            );
            const data = await response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to get full user profile details!");
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const userProfileDetailsSlice = createSlice({
    name: "userProfileDetails",
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getUserProfileDetails.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(getUserProfileDetails.fulfilled, (state, action) => {
            state.userProfileDetails = action.payload;
            state.isLoading = false;
            state.isError = false;
            state.error = null;
        });
        builder.addCase(getUserProfileDetails.rejected, (state, action) => {
            state.userProfileDetails = {}; // Reset to avoid stale data
            state.isLoading = false;
            state.isError = true;
            state.error = action.payload;
        });
    },
});


export default userProfileDetailsSlice.reducer;
