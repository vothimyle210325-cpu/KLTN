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
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { clearMessage, loadStudentDashboard, submitRegistration } from "../../features/registrationSlice";
import { callApi } from "../../api";

const STEPS = ["Khởi tạo", "Đăng ký BCTT", "Duyệt BCTT", "Đăng ký KLTN", "Hoàn thành"];

const GRADIENT = "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)";
const COLOR = "#0284c7";

const SectionHeader = ({ icon, title, subtitle, color, gradient }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha(color, 0.3)}`, "& svg": { color: "white" } }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>{subtitle}</Typography>}
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

export default function StudentRegPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { dashboard, loading, message, error } = useSelector((s) => s.registration);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { type: "BCTT", topic: "", field: "", lecturer: "", dot: "2026-1" }
  });

  useEffect(() => {
    dispatch(loadStudentDashboard(user.email));
  }, [dispatch, user.email]);

  const fields = dashboard?.fields || [];
  const lecturers = dashboard?.lecturers || [];
  const registrations = dashboard?.registrations || [];
  const selectedField = watch("field");
  const type = watch("type");
  const canRegisterKLTN = dashboard?.student?.status === "BCTT_APPROVED";

  const lecturerOptions = useMemo(() => {
    if (!selectedField) return lecturers;
    return lecturers.filter((l) => (l.majors || "").toLowerCase().includes(selectedField.toLowerCase()));
  }, [lecturers, selectedField]);

  const currentStep = useMemo(() => {
    const status = dashboard?.student?.status;
    if (!status || status === "NEW") return 0;
    if (status === "BCTT_REGISTERED") return 1;
    if (status === "BCTT_APPROVED") return 2;
    if (status === "KLTN_REGISTERED" || status === "KLTN_APPROVED") return 4;
    if (status === "KLTN_DONE") return 5;
    return 3;
  }, [dashboard?.student?.status]);

  const approvedBCTT = registrations.find((r) => r.type === "BCTT" && r.status === "APPROVED");
  const pendingRegs = registrations.filter((r) => r.status === "PENDING");
  const rejectedRegs = registrations.filter((r) => r.status === "REJECTED");

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity="success" onClose={() => dispatch(clearMessage())} sx={{ borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => dispatch(clearMessage())} sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* Progress */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                title="Tiến trình hoàn thành KLTN"
                subtitle="Theo doi tien do hoc tap cua ban"
                gradient={GRADIENT}
                color={COLOR}
              />
              <Stepper activeStep={currentStep} alternativeLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 600, fontSize: "0.78rem", mt: 0.5 }, "& .MuiStepIcon-root": { width: 30, height: 30, fontSize: "0.8rem", fontWeight: 700 }, "& .MuiStepConnector-line": { borderColor: "#e2e8f0" } }}>
                {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
              </Stepper>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", display: "block", mb: 1.5 }}>Trạng thái hiện tại</Typography>
              <Stack spacing={1}>
                {[
                  { label: "BCTT", status: approvedBCTT ? "Đã duyệt" : registrations.find((r) => r.type === "BCTT") ? "Chờ duyệt" : "Chưa đăng ký", color: approvedBCTT ? "#059669" : "#d97706" },
                  { label: "Đợt học", value: "2026-1", color: "#475569" },
                  { label: "Đề tài đã ĐK", value: registrations.length, color: "#7c3aed" },
                  { label: "Chờ duyệt", value: pendingRegs.length, color: "#d97706" }
                ].map(({ label, value, status, color }) => (
                  <Stack key={label} direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b", minWidth: 80 }}>{label}:</Typography>
                    {status ? (
                      <Chip label={status} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, color }}>{value}</Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
            title="Đăng ký đề tài"
            subtitle="Hoàn thành BCTT trước khi đăng ký KLTN"
            gradient={GRADIENT}
            color={COLOR}
          />

          {type === "KLTN" && !canRegisterKLTN && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Bạn cần hoàn thành BCTT trước khi đăng ký KLTN.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(async (v) => {
            if (v.type === "KLTN" && !canRegisterKLTN) return;
            const action = await dispatch(submitRegistration({ ...v, student: user.email }));
            if (submitRegistration.fulfilled.match(action) && action.payload?.ok) {
              dispatch(loadStudentDashboard(user.email));
            }
          })}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FieldGroup label="Loại đề tài" required>
                  <TextField fullWidth select {...register("type")}>
                    <MenuItem value="BCTT">BCTT — Bao Cao Thuc Tap</MenuItem>
                    <MenuItem value="KLTN" disabled={!canRegisterKLTN}>KLTN — Luan Van Tot Nghiep {!canRegisterKLTN && "(can BCTT)"}</MenuItem>
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
                            <Typography sx={{ fontSize: "0.875rem" }}>{l.name || l.email}</Typography>
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
                <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5, background: GRADIENT, fontWeight: 700, borderRadius: 2, "&:hover": { boxShadow: `0 4px 14px ${alpha(COLOR, 0.4)}` } }}>
                  {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Registration history */}
      {registrations.length > 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              title="Lịch sử đăng ký"
              subtitle={`${registrations.length} đề tài đã đăng ký`}
              gradient={GRADIENT}
              color={COLOR}
            />
            <Stack spacing={1.5}>
              {registrations.map((r, idx) => (
                <Box key={idx} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, background: GRADIENT, fontWeight: 800, fontSize: "0.875rem" }}>{r.type}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>{r.topic}</Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>GVHD: {r.lecturer || "—"} | Đợt: {r.dot || "—"}</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ ml: "auto" }}>
                      <Chip
                        label={r.status === "APPROVED" ? "Đã duyệt" : r.status === "REJECTED" ? "Đã từ chối" : "Chờ duyệt"}
                        size="small"
                        sx={{
                          bgcolor: r.status === "APPROVED" ? alpha("#059669", 0.1) : r.status === "REJECTED" ? alpha("#dc2626", 0.1) : alpha("#d97706", 0.1),
                          color: r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#d97706",
                          fontWeight: 700, fontSize: "0.7rem", height: 22
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
