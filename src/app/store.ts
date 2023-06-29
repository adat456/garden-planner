import { configureStore} from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import bedsReducer from "../features/beds/bedsSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        beds: bedsReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;