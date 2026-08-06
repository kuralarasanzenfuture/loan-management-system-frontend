import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/auth/authSlice.js";
import roleReducer from "../redux/roles/roleSlice.js";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    
  },
});
