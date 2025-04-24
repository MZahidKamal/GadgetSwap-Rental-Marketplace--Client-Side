import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    userMessagesChain: [],
    isLoading: false,
    isError: false,
    error: null,
};

export const getUserMessagesChain = createAsyncThunk(
    "userMessages/getUserMessagesChain",
    async ({ userEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/messages/get_all_messages_of_a_user`,
                { userEmail }
            );
            const data = response.data;
            //console.log(data.data)
            if (data.status !== 200) throw new Error(data.message || "Failed to get user's messages chain!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while fetching messages");
        }
    }
);

export const addANewMessageToUserMessagesChain = createAsyncThunk(
    "userMessages/addANewMessageToUserMessagesChain",
    async ({ userEmail, newMessageObj, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.post(
                `/messages/add_new_message_from_a_user`,
                {userEmail, newMessageObj}
            );
            const data = response.data;
            // console.log(data)
            if (data.status !== 200) throw new Error(data.message || "Failed to add new message!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while adding message");
        }
    }
);

export const aUserMessagesChainMarkedAsReadByUser = createAsyncThunk(
    "userMessages/aUserMessagesChainMarkedAsReadByUser",
    async ({ userEmail, axiosSecure }, { rejectWithValue }) => {
        try {
            const response = await axiosSecure.patch(
                `/messages/a_users_message_chain_is_marked_as_read_by_user`,
                {userEmail}
            );
            const data = response.data;
            // console.log(data)
            if (data.status !== 200) throw new Error(data.message || "Failed to mark a user's message chain as read by user!");
            return data.data;
        }
        catch (error) {
            return rejectWithValue(error.message || "Network error while marking a user's message chain as read by user");
        }
    }
);

const userMessagesSlice = createSlice({
    name: "userMessages",
    initialState,
    extraReducers: (builder) => {
        builder

            //To get all the messages from a user's message chain.
            .addCase(getUserMessagesChain.pending, (state) => {
                state.userMessagesChain = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getUserMessagesChain.fulfilled, (state, action) => {
                state.userMessagesChain = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(getUserMessagesChain.rejected, (state, action) => {
                state.userMessagesChain = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })


            //To get add a new message to a user's message chain.
            .addCase(addANewMessageToUserMessagesChain.pending, (state) => {
                state.userMessagesChain = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(addANewMessageToUserMessagesChain.fulfilled, (state, action) => {
                state.userMessagesChain = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(addANewMessageToUserMessagesChain.rejected, (state, action) => {
                state.userMessagesChain = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })


            //To mark a user's message chain marked as read by user.
            .addCase(aUserMessagesChainMarkedAsReadByUser.pending, (state) => {
                state.userMessagesChain = [];
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(aUserMessagesChainMarkedAsReadByUser.fulfilled, (state, action) => {
                state.userMessagesChain = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = null;
            })
            .addCase(aUserMessagesChainMarkedAsReadByUser.rejected, (state, action) => {
                state.userMessagesChain = [];
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            });
    },
});

export default userMessagesSlice.reducer;
