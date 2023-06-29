import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bedDataInterface, plantPickDataInterface } from "../../Shared/interfaces";

enum statusEnum {
    idle = "idle",
    loading = "loading",
    succeeded = "succeeded",
    failed = "failed"
};

interface initialStateInterface {
    beds: bedDataInterface[],
    status: statusEnum,
    error: null
};

const initialState: initialStateInterface = {
    beds: [],
    status: statusEnum.idle,
    error: null,
}

const bedsSlice = createSlice({
    name: "beds",
    initialState,
    reducers: {

    },
    extraReducers: builder => {
        builder
            .addCase(fetchBeds.pending, (state) => {
                state.status = statusEnum.loading;
            })
            .addCase(fetchBeds.fulfilled, (state, action) => {
                state.status = statusEnum.succeeded;
                state.beds = action.payload;
            })
            .addCase(fetchBeds.rejected, (state, action) => {
                state.status = statusEnum.failed,
                state.error = action.payload;
            })
            .addCase(updateSeedBasket.fulfilled, (state, action) => {
                const { updatedseedbasket, bedid } = action.payload;

                const currentBed = state.beds.find(bed => bed.id === bedid);
                if (currentBed) {
                    // replacing the current bed's seedbasket with the update from the payload
                    currentBed.seedbasket = updatedseedbasket;
                    // filtering out the outdated bed and pushing in the updated bed
                    state.beds = state.beds.filter(bed => bed.id !== bedid);
                    state.beds.push(currentBed);
                };
            })
    }
});

export const fetchBeds = createAsyncThunk("beds/fetchInfo", async function() {
    const req = await fetch("http://localhost:3000/pull-beds-data", {credentials: "include"});
    const res = await req.json();
    return res;
});

interface updateSeedBasketInterface {
    seedbasket: plantPickDataInterface[],
    bedid: number,
};

export const updateSeedBasket = createAsyncThunk("beds/updateSeedBasket", async function(data: updateSeedBasketInterface) {
    // note that thunk's async fx/payload creator can only have one parameter, so if more than one argument is needed, they should be passed in as an object and may be destructured
    const { seedbasket, bedid } = data;
    const reqOptions: RequestInit = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ seedbasket, bedid }),
        credentials: "include"
    };

    const req = await fetch("http://localhost:3000/update-seed-basket", reqOptions);
    const res = await req.json();
    // formatting the response into an object with the numeric bedid so that it can be processed by the extraReducer above
    return { updatedseedbasket: res, bedid };
});

export const selectBed = (state, bedid) => state.beds.beds.find(bed => bed.id === bedid);   

export default bedsSlice.reducer;