import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { rolesInterface, bedDataInterface, gridMapInterface, plantPickDataInterface } from "../interfaces";

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
            .addCase(updateGrid.fulfilled, (state, action) => {
                const updatedBed = action.payload;
                state.beds = state.beds.map(bed => {
                    if (bed.id === updatedBed.id) {
                        return updatedBed;
                    } else {
                        return bed;
                    };
                });
            })
    }
});

interface updateGridDataInterface {
    gridmap: gridMapInterface[],
    bedid: number,
};

export const updateGrid = createAsyncThunk("beds/updateGrid", async function(data: updateGridDataInterface) {
    const { gridmap, bedid } = data;
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gridmap, bedid }),
        credentials: "include"
    };

    const req = await fetch("http://localhost:3000/save-bed/gridmap", reqOptions);
    const res = await req.json();
    return res;
});
