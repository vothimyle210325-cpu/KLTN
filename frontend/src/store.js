import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import registrationReducer from "./features/registrationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    registration: registrationReducer
  }
});
