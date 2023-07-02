import { configureStore} from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import bedsReducer from "./features/bedsSlice";
import { apiSlice } from "./apiSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        beds: bedsReducer,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;