import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { clearMessage, loadStudentDashboard, submitRegistration } from "../features/registrationSlice";
import { callApi } from "../api";

const STEPS = [
  { label: "Khoi tao", icon: "1" },
  { label: "Đăng ký", icon: "2" },
  { label: "Duyệt", icon: "3" },
  { label: "Nộp bài", icon: "4" },
  { label: "Hoàn thành", icon: "5" }
];

const SectionHeader = ({ icon, title, subtitle, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: 2,
      background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: `0 4px 14px ${alpha(color, 0.3)}`,
      "& svg": { color: "white" }
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const FieldGroup = ({ label, required, children }) => (
  <Box>
    <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>
      {label} {required && <Typography component="span" sx={{ color: "#dc2626" }}>*</Typography>}
    </Typography>
    {children}
  </Box>
);

function StudentPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { dashboard, loading, message, error } = useSelector((s) => s.registration);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { type: "BCTT", topic: "", field: "", lecturer: "", dot: "2026-1" }
  });

  useEffect(() => {
    dispatch(loadStudentDashboard(user.email));
  }, [dispatch, user.email]);

  const type = watch("type");
  const fields = dashboard?.fields || [];
  const lecturers = dashboard?.lecturers || [];
  const registrations = dashboard?.registrations || [];
  const submissions = dashboard?.submissions || [];
  const councils = dashboard?.councils || [];
  const selectedField = watch("field");

  const lecturerOptions = useMemo(() => {
    if (!selectedField) return lecturers;
    return lecturers.filter((l) => (l.majors || "").toLowerCase().includes(selectedField.toLowerCase()));
  }, [lecturers, selectedField]);

  const canRegisterKLTN = dashboard?.student?.status === "BCTT_DONE";

  const currentStep = useMemo(() => {
    const status = dashboard?.student?.status;
    if (!status || status === "NEW") return 0;
    if (status === "BCTT_REGISTERED") return 1;
    if (status === "BCTT_APPROVED") return 2;
    if (status === "BCTT_DONE") return 3;
    if (status === "KLTN_REGISTERED" || status === "KLTN_APPROVED") return 4;
    if (status === "KLTN_DONE") return 5;
    return 0;
  }, [dashboard?.student?.status]);

  async function uploadRealFile(typeName, file) {
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      const uploaded = await callApi("uploadPdfFile", {
        by: user.email, role: "SV", fileName: file.name,
        mimeType: file.type || "application/pdf", base64
      });
      if (!uploaded.ok) return;
      await callApi("saveSubmission", {
        student: user.email, role: "SV", type: typeName, file: uploaded.data.fileUrl
      });
      dispatch(loadStudentDashboard(user.email));
    } catch (e) {
      // silent
    }
  }

  async function uploadUrl(typeName, fileUrl) {
    if (!fileUrl) return;
    await callApi("saveSubmission", { student: user.email, type: typeName, file: fileUrl });
    dispatch(loadStudentDashboard(user.email));
  }

  const bcttSub = submissions.find((s) => s.type === "BCTT");
  const kltnSub = submissions.find((s) => s.type === "KLTN");
  const accent = "#0284c7";
  const accentGrad = "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)";

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity="success" onClose={() => dispatch(clearMessage())} sx={{ borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => dispatch(clearMessage())} sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* === SECTION 1: Profile & Progress === */}
      <Grid container spacing={2.5}>
        {/* Profile */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, overflow: "hidden", height: "100%" }}>
            <Box sx={{ background: accentGrad, p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 52, height: 52, bgcolor: "rgba(255,255,255,0.25)", color: "white", fontWeight: 800, fontSize: "1.2rem", border: "2px solid rgba(255,255,255,0.4)" }}>
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>
                    {user.name || user.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                    {user.email}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                {[
                  { label: "Trang thai", value: dashboard?.student?.status || "NEW", color: "#0284c7" },
                  { label: "Hoc ky", value: "2026-1", color: "#475569" },
                  { label: "Đề tài đã ĐK", value: registrations.length, color: "#7c3aed" },
                  { label: "File đã nộp", value: submissions.length, color: "#059669" }
                ].map(({ label, value, color }) => (
                  <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color, fontSize: "0.875rem" }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Stepper */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                title="Tien trinh hoan thanh"
                subtitle="Theo doi tien do hoc tap"
                color={accent}
              />
              <Stepper activeStep={currentStep} alternativeLabel sx={{
                "& .MuiStepLabel-label": { fontWeight: 600, fontSize: "0.8rem", mt: 0.5 },
                "& .MuiStepIcon-root": { width: 30, height: 30, fontSize: "0.8rem", fontWeight: 700 },
                "& .MuiStepConnector-line": { borderColor: "#e2e8f0" }
              }}>
                {STEPS.map((s) => <Step key={s.label}><StepLabel>{s.label}</StepLabel></Step>)}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === SECTION 2: Registration === */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
            title="Đăng ký đề tài"
            subtitle="Chọn loại đề tài, lĩnh vực và giảng viên hướng dẫn"
            color="#7c3aed"
          />

          <Box component="form" onSubmit={handleSubmit((v) => {
            if (v.type === "KLTN" && !canRegisterKLTN) return;
            dispatch(submitRegistration({ ...v, student: user.email }));
          })}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FieldGroup label="Loại đề tài" required>
                  <TextField fullWidth select {...register("type")}>
                    <MenuItem value="BCTT">BCTT — Báo cáo thực tập</MenuItem>
                    <MenuItem value="KLTN">KLTN — Luận văn tốt nghiệp</MenuItem>
                  </TextField>
                </FieldGroup>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <FieldGroup label="Tên đề tài" required>
                  <TextField fullWidth placeholder="VD: Xay dung he thong quan ly..." {...register("topic", { required: true })} />
                </FieldGroup>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FieldGroup label="Đợt học" required>
                  <TextField fullWidth {...register("dot", { required: true })} />
                </FieldGroup>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FieldGroup label="Lĩnh vực chuyên ngành">
                  <TextField fullWidth select {...register("field")}>
                    <MenuItem value=""><em>-- Không chọn --</em></MenuItem>
                    {fields.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  </TextField>
                </FieldGroup>
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
                <FieldGroup label="Giảng viên hướng dẫn" required>
                  <TextField fullWidth select {...register("lecturer", { required: true })}>
                    <MenuItem value=""><em>-- Chọn GVHD --</em></MenuItem>
                    {lecturerOptions.map((l) => {
                      const pct = Number(l.quota) > 0 ? (Number(l.currentSlot) / Number(l.quota)) : 0;
                      return (
                        <MenuItem key={l.email} value={l.email}>
                          <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", pr: 1 }}>
                            <Typography>{l.name || l.email}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: pct >= 1 ? "#dc2626" : "#059669" }}>
                              {Number(l.currentSlot || 0)}/{Number(l.quota || 0)}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </FieldGroup>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    background: accentGrad,
                    fontWeight: 700,
                    borderRadius: 2,
                    "&:hover": { boxShadow: `0 4px 14px ${alpha("#0284c7", 0.4)}` }
                  }}
                >
                  {loading ? "Đang xử lý…" : "Đăng ký ngay"}
                </Button>
              </Grid>
            </Grid>

            {type === "KLTN" && !canRegisterKLTN && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                Bạn cần hoàn thành BCTT trước khi đăng ký KLTN.
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* === SECTION 3: File Upload === */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
            title="Nộp bài tập & luận văn"
            subtitle="Upload file PDF truc tiep len Google Drive"
            color="#059669"
          />

          <Grid container spacing={2.5}>
            {/* BCTT */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2.5, borderRadius: 2.5, border: `1.5px solid ${bcttSub?.file ? "#059669" : "#e2e8f0"}`, bgcolor: bcttSub?.file ? alpha("#059669", 0.03) : "#f8fafc", transition: "all 0.2s" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="BCTT" size="small" sx={{ fontWeight: 800, bgcolor: alpha("#7c3aed", 0.1), color: "#7c3aed" }} />
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Bao Cao Thuc Tap
                    </Typography>
                  </Stack>
                  {bcttSub?.file ? (
                    <Chip icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>} label="Đã nộp" size="small" sx={{ bgcolor: alpha("#059669", 0.1), color: "#059669", fontWeight: 700, "& .MuiChip-icon": { color: "#059669" } }} />
                  ) : (
                    <Chip label="Chưa nộp" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700 }} />
                  )}
                </Stack>

                {bcttSub?.file && (
                  <Stack spacing={0.75} mb={2}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Điểm: <strong style={{ color: "#0f172a" }}>{bcttSub.score || "Chưa chấm"}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", wordBreak: "break-all", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {bcttSub.file}
                    </Typography>
                  </Stack>
                )}

                <Button variant="outlined" component="label" fullWidth startIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>} sx={{ borderRadius: 2, fontWeight: 700, borderColor: alpha("#059669", 0.4), color: "#059669", "&:hover": { borderColor: "#059669", bgcolor: alpha("#059669", 0.04) } }}>
                  {bcttSub?.file ? "Tải lên lại" : "Chọn file PDF"}
                  <input hidden type="file" id="student-upload-bctt" accept="application/pdf" onChange={(e) => uploadRealFile("BCTT", e.target.files?.[0])} />
                </Button>

                <Stack direction="row" spacing={1} mt={1.5} alignItems="center">
                  <TextField size="small" fullWidth placeholder="Hoac nhap URL Google Drive..." onBlur={(e) => setValue("bcttUrl", e.target.value)} />
                  <Button size="small" variant="text" onClick={() => uploadUrl("BCTT", watch("bcttUrl"))} sx={{ fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                    Luu
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* KLTN */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2.5, borderRadius: 2.5, border: `1.5px solid ${kltnSub?.file ? "#059669" : "#e2e8f0"}`, bgcolor: kltnSub?.file ? alpha("#059669", 0.03) : "#f8fafc", transition: "all 0.2s" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="KLTN" size="small" sx={{ fontWeight: 800, bgcolor: alpha("#dc2626", 0.1), color: "#dc2626" }} />
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Luan Van Tot Nghiep
                    </Typography>
                  </Stack>
                  {kltnSub?.file ? (
                    <Chip icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>} label="Đã nộp" size="small" sx={{ bgcolor: alpha("#059669", 0.1), color: "#059669", fontWeight: 700, "& .MuiChip-icon": { color: "#059669" } }} />
                  ) : (
                    <Chip label="Chưa nộp" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700 }} />
                  )}
                </Stack>

                {kltnSub?.file && (
                  <Stack spacing={0.75} mb={2}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Điểm: <strong style={{ color: "#0f172a" }}>{kltnSub.score || "Chưa chấm"}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", wordBreak: "break-all", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {kltnSub.file}
                    </Typography>
                  </Stack>
                )}

                <Button variant="outlined" component="label" fullWidth startIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>} sx={{ borderRadius: 2, fontWeight: 700, borderColor: alpha("#dc2626", 0.4), color: "#dc2626", "&:hover": { borderColor: "#dc2626", bgcolor: alpha("#dc2626", 0.04) } }}>
                  {kltnSub?.file ? "Tải lên lại" : "Chọn file PDF"}
                  <input hidden type="file" id="student-upload-kltn" accept="application/pdf" onChange={(e) => uploadRealFile("KLTN", e.target.files?.[0])} />
                </Button>

                <Stack direction="row" spacing={1} mt={1.5} alignItems="center">
                  <TextField size="small" fullWidth placeholder="Hoac nhap URL Google Drive..." onBlur={(e) => setValue("kltnUrl", e.target.value)} />
                  <Button size="small" variant="text" onClick={() => uploadUrl("KLTN", watch("kltnUrl"))} sx={{ fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                    Luu
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* === SECTION 4: Status Timeline === */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            title="Lịch sử hoạt động"
            subtitle="Theo dõi tất cả trạng thái và hoạt động"
            color="#d97706"
          />

          <List disablePadding>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: alpha("#059669", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>Tài khoản khởi tạo thành công</Typography>}
                secondary={<Typography variant="caption" sx={{ color: "#64748b" }}>Tài khoản đã được tạo và duyệt bởi quản trị viên</Typography>}
              />
            </ListItem>

            {registrations.map((r) => (
              <ListItem key={r.id} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: r.status === "APPROVED" ? alpha("#059669", 0.1) : r.status === "REJECTED" ? alpha("#dc2626", 0.1) : alpha("#d97706", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {r.status === "APPROVED" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : r.status === "REJECTED" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        Đăng ký {r.type}: {r.topic}
                      </Typography>
                      <Chip label={r.status === "APPROVED" ? "Đã duyệt" : r.status === "REJECTED" ? "Đã từ chối" : "Đang chờ"} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: r.status === "APPROVED" ? alpha("#059669", 0.1) : r.status === "REJECTED" ? alpha("#dc2626", 0.1) : alpha("#d97706", 0.1), color: r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#d97706" }} />
                    </Stack>
                  }
                  secondary={<Typography variant="caption" sx={{ color: "#64748b" }}>Dot: {r.dot || "—"} | GVHD: {r.lecturer || "—"}</Typography>}
                />
              </ListItem>
            ))}

            {submissions.map((s) => (
              <ListItem key={`${s.student}-${s.type}`} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: s.file ? alpha("#059669", 0.1) : alpha("#94a3b8", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.file ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>Nộp tệp {s.type}</Typography>
                      {s.file && <Chip icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>} label="Đã nộp" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: alpha("#059669", 0.1), color: "#059669", "& .MuiChip-icon": { color: "#059669", fontSize: 10 } }} />}
                    </Stack>
                  }
                  secondary={<Typography variant="caption" sx={{ color: "#64748b" }}>Điểm: <strong>{s.score || "Chưa chấm"}</strong></Typography>}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
            Thông tin hội đồng bảo vệ
          </Typography>
          {councils.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: "0.8125rem" }}>Chưa có lịch hội đồng.</Alert>
          ) : (
            <Grid container spacing={1.5}>
              {councils.map((c, idx) => (
                <Grid item xs={12} key={idx}>
                  <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                    <Grid container spacing={1.5}>
                      {[
                        { label: "GVHD", value: c.gvhd },
                        { label: "GVPB", value: c.gvpb },
                        { label: "Chu tich", value: c.chairman },
                        { label: "Thu ky", value: c.secretary },
                        { label: "Ngay", value: c.date },
                        { label: "Địa điểm", value: c.location }
                      ].map(({ label, value }) => (
                        <Grid item xs={6} sm={4} md={2} key={label}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", display: "block" }}>{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem" }}>{value || "—"}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                    {c.minutesUrl && String(c.minutesUrl).startsWith("http") && (
                      <Box sx={{ mt: 1.5 }}>
                        <Button size="small" variant="contained" href={c.minutesUrl} target="_blank" rel="noreferrer" sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none" }}>
                          Biên bản họp hội đồng
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const comma = raw.indexOf(",");
      resolve(comma >= 0 ? raw.slice(comma + 1) : raw);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default StudentPage;
