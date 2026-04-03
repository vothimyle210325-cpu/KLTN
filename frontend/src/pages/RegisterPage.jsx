import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { clearAuthNotice, registerAccount } from "../features/authSlice";
import { MAJOR_OPTIONS, TRAINING_SYSTEM_OPTIONS } from "../config/uiStrings";
import { HcmuteLogo, HCMUTE_BRAND } from "../components/HcmuteLogo";

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IdIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function RegisterPage({ onBackToLogin, onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error, registerMessage } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      major: MAJOR_OPTIONS[0],
      trainingSystem: TRAINING_SYSTEM_OPTIONS[0],
      mssv: ""
    }
  });
  const majorValue = watch("major");
  const trainingSystemValue = watch("trainingSystem");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f4f8", p: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        {/* Mobile logo */}
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 3 }}>
          <HcmuteLogo height={52} sx={{ flexShrink: 0 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e40af", lineHeight: 1.2 }}>
              KLTN Portal
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block" }}>
              {HCMUTE_BRAND.fullVi}
            </Typography>
          </Box>
        </Stack>

        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{
            height: 4,
            background: "linear-gradient(90deg, #0d9488, #14b8a6, #0284c7)"
          }} />

          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 2.5,
                background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                  Tạo tài khoản sinh viên
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                  Đăng ký để tiếp cận hệ thống
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.8125rem" }}>
              Chỉ sinh viên mới được phép đăng ký. Tài khoản sẽ được duyệt bởi quản trị viên.
            </Alert>

            <form onSubmit={handleSubmit(async (values) => {
              const trimmed = { ...values, password: values.password.trim() };
              const result = await dispatch(registerAccount(trimmed)).unwrap();
              if (result.ok) {
                dispatch(clearAuthNotice());
                onSuccess();
              }
            })}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                    Họ và tên đầy đủ *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nguyễn Văn A"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><UserIcon /></InputAdornment>
                      )
                    }}
                    {...register("name", { required: true })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                    Email sinh viên *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="sv123456@stu.edu.vn"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><MailIcon /></InputAdornment>
                      )
                    }}
                    {...register("email", { required: true })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                    Mật khẩu *
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><LockIcon /></InputAdornment>
                      )
                    }}
                    {...register("password", { required: true })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                    Mã số sinh viên (MSSV) *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="20210001"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><IdIcon /></InputAdornment>
                      )
                    }}
                    {...register("mssv", { required: true })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                    Chuyên ngành
                  </Typography>
                  <TextField fullWidth select label="Chuyên ngành" {...register("major")} value={majorValue}>
                    {MAJOR_OPTIONS.map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                    Hệ đào tạo
                  </Typography>
                  <TextField fullWidth select label="Hệ đào tạo" {...register("trainingSystem")} value={trainingSystemValue}>
                    {TRAINING_SYSTEM_OPTIONS.map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                {registerMessage && (
                  <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => dispatch(clearAuthNotice())}>
                    {registerMessage}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2.5,
                    fontSize: "1rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                    boxShadow: "0 4px 14px rgba(13, 148, 136, 0.35)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                      boxShadow: "0 6px 20px rgba(13, 148, 136, 0.45)",
                      transform: "translateY(-1px)"
                    }
                  }}
                >
                  {loading ? "Đang xử lý…" : "Đăng ký tài khoản"}
                </Button>

                <Button
                  type="button"
                  variant="text"
                  size="large"
                  startIcon={<ArrowLeftIcon />}
                  onClick={() => {
                    dispatch(clearAuthNotice());
                    onBackToLogin();
                  }}
                  sx={{
                    color: "#64748b",
                    fontWeight: 600,
                    borderRadius: 2.5,
                    "&:hover": { bgcolor: alpha("#64748b", 0.06), color: "#334155" }
                  }}
                >
                  Quay lại trang đăng nhập
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default RegisterPage;
