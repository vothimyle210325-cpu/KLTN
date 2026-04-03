import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { login } from "../features/authSlice";
import { HcmuteLogo, HCMUTE_BRAND } from "../components/HcmuteLogo";

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function LoginPage({ onOpenRegister }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit } = useForm({
    defaultValues: { email: "", password: "" }
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#f0f4f8"
      }}
    >
      {/* Left Hero Panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "45%",
          background: "linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #2563eb 70%, #3b82f6 100%)",
          position: "relative",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 5,
          overflow: "hidden"
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)", top: -80, right: -80 }} />
        <Box sx={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)", bottom: -60, left: -40 }} />
        <Box sx={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", top: "30%", left: "10%" }} />

        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <HcmuteLogo height={112} onDarkBackground sx={{ borderRadius: 3 }} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            mb: 2,
            lineHeight: 1.2
          }}
        >
          KLTN Portal
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            fontWeight: 500,
            mb: 1,
            lineHeight: 1.5
          }}
        >
          Hệ thống quản lý luận văn<br />tốt nghiệp
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            fontWeight: 400,
            maxWidth: 340,
            lineHeight: 1.7
          }}
        >
          {HCMUTE_BRAND.fullVi}<br />
          ({HCMUTE_BRAND.short}) — 2026
        </Typography>

        {/* Feature pills */}
        <Stack direction="row" spacing={1.5} mt={4} flexWrap="wrap" justifyContent="center">
          {["Đăng ký đề tài", "Theo dõi trạng thái", "Chấm điểm trực tuyến"].map((feat) => (
            <Box key={feat} sx={{
              px: 1.5, py: 0.5, borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)"
            }}>
              <Typography sx={{ color: "white", fontSize: "0.75rem", fontWeight: 600 }}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 }
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          {/* Mobile logo */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ display: { xs: "flex", md: "none" }, mb: 3 }}>
            <HcmuteLogo height={48} sx={{ flexShrink: 0 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e40af" }}>
              KLTN Portal
            </Typography>
          </Stack>

          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            {/* Card header accent */}
            <Box sx={{
              height: 4,
              background: "linear-gradient(90deg, #1e40af, #3b82f6, #0284c7)"
            }} />

            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: 2.5,
                  background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                    Chào mừng trở lại
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                    Đăng nhập để truy cập hệ thống
                  </Typography>
                </Box>
              </Stack>

              <form onSubmit={handleSubmit((v) => dispatch(login(v)))}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                      Địa chỉ email
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="email@stu.edu.vn"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailIcon />
                          </InputAdornment>
                        )
                      }}
                      {...register("email", { required: true })}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
                      Mật khẩu
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      placeholder="Nhập mật khẩu của bạn"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        )
                      }}
                      {...register("password", { required: true })}
                    />
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
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
                      background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                      boxShadow: "0 4px 14px rgba(30, 64, 175, 0.35)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                        boxShadow: "0 6px 20px rgba(30, 64, 175, 0.45)",
                        transform: "translateY(-1px)"
                      }
                    }}
                  >
                    {loading ? "Đang xử lý…" : "Đăng nhập"}
                  </Button>

                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.5
                  }}>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2e8f0" }} />
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                      hoặc
                    </Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2e8f0" }} />
                  </Box>

                  <Button
                    type="button"
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={onOpenRegister}
                    sx={{
                      py: 1.5,
                      borderRadius: 2.5,
                      fontSize: "0.9375rem",
                      fontWeight: 700,
                      borderWidth: "1.5px",
                      borderColor: alpha("#1e40af", 0.3),
                      color: "#1e40af",
                      "&:hover": {
                        borderWidth: "1.5px",
                        borderColor: "#1e40af",
                        bgcolor: alpha("#1e40af", 0.04)
                      }
                    }}
                  >
                    Tạo tài khoản sinh viên mới
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>

          <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2.5, color: "#94a3b8" }}>
            Hệ thống quản lý luận văn tốt nghiệp — {HCMUTE_BRAND.short}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
