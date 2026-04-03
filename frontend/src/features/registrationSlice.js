import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callApi } from "../api";

export const loadStudentDashboard = createAsyncThunk(
  "registration/loadDashboard",
  async (email) => callApi("getStudentDashboard", { email })
);

export const submitRegistration = createAsyncThunk(
  "registration/submitRegistration",
  async (payload) => callApi("createRegistration", payload)
);

const registrationSlice = createSlice({
  name: "registration",
  initialState: {
    dashboard: null,
    loading: false,
    message: "",
    error: ""
  },
  reducers: {
    clearMessage(state) {
      state.message = "";
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadStudentDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStudentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.ok) state.dashboard = action.payload.data;
        else state.error = action.payload.message || "Không tải được dữ liệu";
      })
      .addCase(loadStudentDashboard.rejected, (state) => {
        state.loading = false;
        state.error = "Không kết nối được trang tổng quan";
      })
      .addCase(submitRegistration.pending, (state) => {
        state.loading = true;
        state.message = "";
        state.error = "";
      })
      .addCase(submitRegistration.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.ok) state.message = "Đăng ký thành công";
        else state.error = action.payload.message || "Đăng ký thất bại";
      })
      .addCase(submitRegistration.rejected, (state) => {
        state.loading = false;
        state.error = "Không kết nối được API";
      });
  }
});

export const { clearMessage } = registrationSlice.actions;
export default registrationSlice.reducer;
