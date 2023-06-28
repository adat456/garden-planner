import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const bedsSlice = createSlice({
    name: "beds",
    initialState: {
        beds: [],
        status: "idle",
        error: null,
    },
    reducers: {

    },
    extraReducers: builder => {
        builder
            .addCase(fetchBeds.pending, (state) => {
                state.status = "loading;"
            })
            .addCase(fetchBeds.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.beds = action.payload;
            })
            .addCase(fetchBeds.rejected, (state, action) => {
                state.status = "failed",
                state.error = action.payload;
            })
    }
});

export const fetchBeds = createAsyncThunk("beds/fetchInfo", async function() {
    const req = await fetch("http://localhost:3000/pull-beds-data", {credentials: "include"});
    const res = await req.json();
    return res;
});

export const updateSeedBasket = createAsyncThunk("beds/updatedSeedBasket", async function(body) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ body }),
        credentials: "include"
    };

    const req = await fetch("http://localhost:3000/update-seed-basket", reqOptions);
    const res = await req.json();
    return res;
});

export const selectBed = (state, bedId) => state.beds.beds.find(bed => bed.id === bedId);   

export default bedsSlice.reducer;