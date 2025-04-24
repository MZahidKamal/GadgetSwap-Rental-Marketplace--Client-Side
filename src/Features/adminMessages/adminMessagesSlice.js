import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
    allUserMessagesChain: [],
    isLoading: false,
    isError: false,
    error: null,
};


export const getAllUserMessagesChain = createAsyncThunk(
    "adminMessages/getAllUserMessagesChain",
    async ({ adminEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/messages/get_all_messages_of_all_users_for_admin`,
                { adminEmail }
            );
            const data = response.data;
            if (data.status !== 200) throw new Error(data.message || "Failed to get all user's messages chain for admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while fetching messages");
        }
    }
);

export const addANewMessageFromAdminToUserMessagesChain = createAsyncThunk(
    "adminMessages/addANewMessageFromAdminToUserMessagesChain",
    async ({ adminEmail, targetUserId, newMessageObjFromAdmin, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.patch(
                `/messages/add_new_message_from_admin_to_a_user`,
                {adminEmail, targetUserId, newMessageObjFromAdmin}
            );
            const data = response.data;
            // console.log(data)
            if (data.status !== 200) throw new Error(data.message || "Failed to add new message from admin to a user!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while adding message");
        }
    }
);


export const aUserMessagesChainMarkedAsReadByAdmin = createAsyncThunk(
    "adminMessages/aUserMessagesChainMarkedAsReadByAdmin",
    async ({ adminEmail, targetUserEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.patch(
                `/messages/a_users_message_chain_is_marked_as_read_by_admin`,
                {adminEmail, targetUserEmail}
            );
            const data = response.data;
            // console.log(data)
            if (data.status !== 200) throw new Error(data.message || "Failed to mark a user's message chain as read by admin!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while marking a user's message chain as read by admin");
        }
    }
);


const adminMessagesSlice = createSlice({
    name: "adminMessages",
    initialState,
    extraReducers: (builder) => {
        builder

            //To get all the messages from all user's message chain.
            .addCase(getAllUserMessagesChain.pending, (state) => {
                state.allUserMessagesChain = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllUserMessagesChain.fulfilled, (state, action) => {
                state.allUserMessagesChain = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllUserMessagesChain.rejected, (state, action) => {
                state.allUserMessagesChain = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })


            //To get add a new message from admin to a user's message chain.
            .addCase(addANewMessageFromAdminToUserMessagesChain.pending, (state) => {
                state.allUserMessagesChain = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(addANewMessageFromAdminToUserMessagesChain.fulfilled, (state, action) => {
                state.allUserMessagesChain = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(addANewMessageFromAdminToUserMessagesChain.rejected, (state, action) => {
                state.allUserMessagesChain = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })


            //To mark a user's message chain marked as read by admin.
            .addCase(aUserMessagesChainMarkedAsReadByAdmin.pending, (state) => {
                state.allUserMessagesChain = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(aUserMessagesChainMarkedAsReadByAdmin.fulfilled, (state, action) => {
                state.allUserMessagesChain = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(aUserMessagesChainMarkedAsReadByAdmin.rejected, (state, action) => {
                state.allUserMessagesChain = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            });
    },
});

export default adminMessagesSlice.reducer;
