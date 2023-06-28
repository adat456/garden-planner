import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: {},
        status: "idle",
        error: null
    },
    reducers: {
        userInfoWiped(state) {
            state.user = {};
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchUserInfo.pending, (state) => {
                state.status = "loading;"
            })
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.status = "failed",
                state.error = action.payload;
            })
    }
});

export const fetchUserInfo = createAsyncThunk("user/fetchInfo", async function() {
    const res = await fetch("http://localhost:3000/pull-user-data", {credentials: "include"});
    const req = await res.json();
    return req;
});

export const { userInfoWiped } = userSlice.actions;

export default userSlice.reducer;