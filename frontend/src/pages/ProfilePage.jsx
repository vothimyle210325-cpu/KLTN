import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { updateUser } from "../features/authSlice";
import { callApi } from "../api";
import { MAJOR_OPTIONS, TRAINING_SYSTEM_OPTIONS } from "../config/uiStrings";

const ACCENT = "#1e40af";
const GRADIENT = "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    major: user?.major || "",
    trainingSystem: user?.trainingSystem || "",
    studentId: user?.studentId || user?.mssv || "",
    address: user?.address || "",
    bio: user?.bio || ""
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const initials = (form.name || user?.email || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        major: form.major,
        trainingSystem: form.trainingSystem,
        mssv: form.studentId,
        email: user.email,
        by: user.email,
        role: user.role
      };
      if (avatarFile) {
        const base64 = await toBase64(avatarFile);
        payload.avatarBase64 = base64;
        payload.avatarMime = avatarFile.type;
      }
      const res = await callApi("updateUserProfile", payload);
      if (res.ok) {
        dispatch(updateUser({ ...user, ...form, mssv: form.studentId, trainingSystem: form.trainingSystem }));
        setMessage("Cập nhật hồ sơ thành công!");
      } else {
        setMessage(res.message || "Lỗi khi lưu hồ sơ");
      }
    } catch (e) {
      setMessage("Lỗi kết nối!");
    }
    setSaving(false);
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("Mật khẩu mới không khớp!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage("Mật khẩu mới phải ít nhất 6 ký tự!");
      return;
    }
    setSaving(true);
    const res = await callApi("changePassword", {
      email: user.email,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    if (res.ok) {
      setMessage("Đổi mật khẩu thành công!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setMessage(res.message || "Lỗi đổi mật khẩu");
    }
    setSaving(false);
  }

  const roleColors = { SV: "#0284c7", GV: "#7c3aed", TBM: "#7c3aed", ADMIN: "#dc2626", THUKY: "#059669", CHUTICH: "#059669" };
  const roleLabels = { SV: "Sinh Viên", GV: "Giảng Viên", TBM: "Trưởng Bộ Môn", ADMIN: "Quản Trị", THUKY: "Thư Ký HĐ", CHUTICH: "Chủ Tịch HĐ" };

  return (
    <Stack spacing={3}>
      {message && (
        <Alert severity={message.includes("Lỗi") || message.includes("không khớp") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      {/* Profile Header */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ background: GRADIENT, p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 100, height: 100, fontSize: "2rem", fontWeight: 800, bgcolor: "rgba(255,255,255,0.25)", color: "white", border: "3px solid rgba(255,255,255,0.4)" }}
              >
                {initials}
              </Avatar>
              <Box component="label" sx={{
                position: "absolute", bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: "50%",
                bgcolor: "white", border: "2px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#f0f4f8" }
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <input hidden type="file" id="avatar-upload" accept="image/*" onChange={handleAvatar} />
              </Box>
            </Box>
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>
                {form.name || user?.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
                {user?.email}
              </Typography>
              <Stack direction="row" spacing={1} mt={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                <Chip label={roleLabels[user?.role] || user?.role} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }} />
                <Chip label="Học kỳ 2026-1" size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }} />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Edit Profile */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${alpha(ACCENT, 0.3)}` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Thông tin cá nhân</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Cập nhật thông tin hồ sơ của bạn</Typography>
                </Box>
              </Stack>

              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Họ và tên <Typography component="span" sx={{ color: "#dc2626" }}>*</Typography></Typography>
                      <TextField fullWidth size="small" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Email <Typography component="span" sx={{ color: "#64748b", fontStyle: "italic" }}>(không đổi được)</Typography></Typography>
                      <TextField fullWidth size="small" value={form.email} disabled sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Số điện thoại</Typography>
                      <TextField fullWidth size="small" placeholder="VD: 0912 345 678" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Mã số sinh viên</Typography>
                      <TextField fullWidth size="small" placeholder="VD: 20210001" value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Chuyên ngành</Typography>
                      <TextField fullWidth size="small" select value={form.major} onChange={(e) => setForm((p) => ({ ...p, major: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                        <MenuItem value="">-- Chọn chuyên ngành --</MenuItem>
                        {MAJOR_OPTIONS.map((m) => (
                          <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Hệ đào tạo</Typography>
                      <TextField fullWidth size="small" select value={form.trainingSystem} onChange={(e) => setForm((p) => ({ ...p, trainingSystem: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                        <MenuItem value="">-- Chọn hệ đào tạo --</MenuItem>
                        {TRAINING_SYSTEM_OPTIONS.map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Địa chỉ</Typography>
                      <TextField fullWidth size="small" placeholder="VD: 123 Nguyễn Trãi, Q.1, TP.HCM" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Giới thiệu bản thân</Typography>
                      <TextField fullWidth size="small" multiline rows={3} placeholder="Viết vài dòng giới thiệu về bản thân..." value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Box>
                  </Grid>
                </Grid>

                <Button variant="contained" onClick={saveProfile} disabled={saving} sx={{ background: GRADIENT, fontWeight: 700, borderRadius: 2, py: 1.25, "&:hover": { boxShadow: `0 4px 14px ${alpha(ACCENT, 0.4)}` } }}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={5}>
          {/* Change password */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, background: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${alpha("#dc2626", 0.3)}` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Đổi mật khẩu</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Bảo mật tài khoản của bạn</Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Mật khẩu hiện tại</Typography>
                  <TextField fullWidth size="small" type="password" placeholder="Nhập mật khẩu cũ" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Mật khẩu mới</Typography>
                  <TextField fullWidth size="small" type="password" placeholder="Ít nhất 6 ký tự" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Xác nhận mật khẩu mới</Typography>
                  <TextField fullWidth size="small" type="password" placeholder="Nhập lại mật khẩu mới" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                </Box>
                <Button variant="contained" color="error" onClick={changePassword} disabled={saving || !passwordForm.oldPassword || !passwordForm.newPassword} sx={{ fontWeight: 700, borderRadius: 2, py: 1.25 }}>
                  {saving ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Account info */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Thông tin tài khoản</Typography>
              <Stack spacing={1.5}>
                {[
                  { label: "Vai trò", value: roleLabels[user?.role] || user?.role, color: roleColors[user?.role] },
                  { label: "Email", value: user?.email },
                  { label: "MSSV", value: form.studentId || "—" },
                    { label: "Hệ đào tạo", value: form.trainingSystem || "—" },
                  { label: "Ngày tham gia", value: user?.createdAt || "—" },
                  { label: "Học kỳ", value: "2026-1" },
                  { label: "Trạng thái", value: "Hoạt động", color: "#059669" }
                ].map(({ label, value, color }) => (
                  <Stack key={label} direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b", minWidth: 100 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: color || "#0f172a", textAlign: "right", wordBreak: "break-all", fontSize: "0.8125rem" }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const raw = String(reader.result || ""); const comma = raw.indexOf(","); resolve(comma >= 0 ? raw.slice(comma + 1) : raw); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
