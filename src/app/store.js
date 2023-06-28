import { configureStore} from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import bedsReducer from "../features/beds/bedsSlice";

export default configureStore({
    reducer: {
        user: userReducer,
        beds: bedsReducer,
    },
});