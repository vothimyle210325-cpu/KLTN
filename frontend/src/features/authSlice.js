import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callApi } from "../api";

export const login = createAsyncThunk("auth/login", async (payload) => {
  return callApi("login", payload);
});
export const registerAccount = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  const trimmed = {
    ...payload,
    password: String(payload.password || "").trim()
  };
  const result = await callApi("register", trimmed);
  if (!result.ok) return rejectWithValue(result);
  return result;
});

function getStoredUser() {
  try {
    const raw = localStorage.getItem("kltn_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getStoredUser(),
    loading: false,
    error: "",
    registerMessage: ""
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.error = "";
      localStorage.removeItem("kltn_user");
    },
    clearAuthNotice(state) {
      state.error = "";
      state.registerMessage = "";
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("kltn_user", JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.registerMessage = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.ok) {
          const userData = action.payload.data;
          if (userData.status === "PENDING") {
            state.error = "Tài khoản của bạn chưa được duyệt. Vui lòng liên hệ quản trị viên.";
            state.user = null;
          } else {
            state.user = userData;
            localStorage.setItem("kltn_user", JSON.stringify(userData));
          }
        } else {
          state.error = action.payload.message || "Đăng nhập thất bại";
          // Auto-debug: gọi debugLogin khi login thất bại để xem byte-level password
          import("../api").then(({ callApi }) => {
            callApi("debugLogin", action.meta.arg).then((d) => {
              if (!d.ok) {
                console.group("[KLTN DEBUG LOGIN]");
                console.log("Lý do:", d.reason);
                if (d.reason === "password_mismatch") {
                  console.log("Password trong sheet (length=" + d.storedLen + "):", d.storedPw);
                  console.log("Mã ASCII stored:", d.storedPwBytes);
                  console.log("Password bạn nhập (length=" + d.typedLen + "):", d.typedPw);
                  console.log("Mã ASCII typed:", d.typedPwBytes);
                  console.log("Trùng khớp?", d.match);
                }
                if (d.allEmails) console.log("Tất cả email trong sheet:", d.allEmails);
                console.groupEnd();
              }
            }).catch(() => {});
          });
        }
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.error = "Không thể kết nối API";
      })
      .addCase(registerAccount.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.registerMessage = "";
      })
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.ok) state.registerMessage = "Đăng ký tài khoản thành công. Vui lòng đăng nhập.";
        else state.error = action.payload.message || "Đăng ký thất bại";
      })
      .addCase(registerAccount.rejected, (state) => {
        state.loading = false;
        state.error = "Không thể kết nối API";
      });
  }
});

export const { logout, clearAuthNotice, updateUser } = authSlice.actions;
export default authSlice.reducer;
