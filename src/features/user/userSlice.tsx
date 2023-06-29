import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userInterface } from "../../Shared/interfaces";

enum statusEnum {
    idle = "idle",
    loading = "loading",
    succeeded = "succeeded",
    failed = "failed"
};

interface initialStateInterface {
    user: userInterface,
    status: statusEnum,
    error: null
};

const initialState: initialStateInterface = {
    user: {},
    status: statusEnum.idle,
    error: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        userInfoWiped(state) {
            state.user = {};
            state.status = "";
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchUserInfo.pending, (state) => {
                state.status = statusEnum.loading;
            })
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.status = statusEnum.succeeded;
                state.user = action.payload;
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.status = statusEnum.failed,
                state.error = action.payload;
            })
    }
});

export const fetchUserInfo = createAsyncThunk("user/fetchUserInfo", async function() {
    const res = await fetch("http://localhost:3000/pull-user-data", {credentials: "include"});
    const req = await res.json();
    return req;
});

export const { userInfoWiped } = userSlice.actions;

export default userSlice.reducer;