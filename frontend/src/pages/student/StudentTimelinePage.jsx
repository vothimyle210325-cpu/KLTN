import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { loadStudentDashboard } from "../../features/registrationSlice";
import { callApi } from "../../api";

const GRADIENT = "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)";
const GRADIENT_GREEN = "linear-gradient(135deg, #059669 0%, #14b8a6 100%)";
const GRADIENT_RED = "linear-gradient(135deg, #dc2626 0%, #f87171 100%)";
const GRADIENT_PURPLE = "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)";
const COLOR = "#d97706";

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

const STUDENT_STATUS_CONFIG = {
  NEW: { label: "Tài khoản mới", color: "#64748b", gradient: "" },
  PENDING: { label: "Chờ duyệt", color: "#d97706", gradient: "" },
  BCTT_REGISTERED: { label: "Đã đăng ký BCTT", color: "#7c3aed", gradient: GRADIENT_PURPLE },
  BCTT_SUBMITTED: { label: "Đã nộp BCTT", color: "#0891b2", gradient: "" },
  BCTT_APPROVED: { label: "BCTT Dat", color: "#059669", gradient: GRADIENT_GREEN },
  BCTT_REJECTED: { label: "BCTT Không đạt", color: "#dc2626", gradient: GRADIENT_RED },
  KLTN_REGISTERED: { label: "Đã đăng ký KLTN", color: "#7c3aed", gradient: GRADIENT_PURPLE },
  COUNCIL_ASSIGNED: { label: "Đã phân hội đồng", color: "#0891b2", gradient: "" },
  SUBMITTED: { label: "Đã nộp KLTN", color: "#0891b2", gradient: "" },
  DEFENDED: { label: "Đã bảo vệ", color: "#059669", gradient: GRADIENT_GREEN },
  COMPLETED: { label: "Hoàn thành", color: "#059669", gradient: GRADIENT_GREEN }
};

function StudentStatusChip({ status }) {
  const cfg = STUDENT_STATUS_CONFIG[status] || { label: status || "Chưa xác định", color: "#64748b", gradient: "" };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: alpha(cfg.color, 0.1),
        color: cfg.color,
        fontWeight: 700,
        fontSize: "0.8rem",
        background: cfg.gradient ? undefined : undefined,
        backgroundImage: cfg.gradient ? cfg.gradient : undefined,
        ...(cfg.gradient && { background: cfg.gradient, color: "white", border: "none" })
      }}
    />
  );
}

function ScoreChip({ score, label }) {
  if (!score && score !== 0) return <Chip label={label || "Chưa chấm"} size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />;
  const num = Number(score);
  const color = num >= 8 ? "#059669" : num >= 5 ? "#d97706" : "#dc2626";
  return <Chip label={`${label ? label + ": " : ""}${score}`} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: "0.8rem" }} />;
}

function DeadlineCard({ label, deadline, status, type }) {
  const now = new Date();
  const isPast = deadline && new Date(deadline) < now;
  const isToday = deadline && new Date(deadline).toDateString() === now.toDateString();
  const accentColor = isPast ? "#dc2626" : isToday ? "#d97706" : "#059669";
  const bgColor = isPast ? alpha("#dc2626", 0.05) : isToday ? alpha("#d97706", 0.05) : alpha("#059669", 0.05);

  return (
    <Box sx={{ p: 2, borderRadius: 2.5, border: `1.5px solid ${alpha(accentColor, 0.2)}`, bgcolor: bgColor }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: accentColor, textTransform: "uppercase", fontSize: "0.65rem", display: "block", mb: 0.25 }}>{label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
            {deadline ? new Date(deadline).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Chưa đặt"}
          </Typography>
          {deadline && (
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {isPast ? "Qua han" : isToday ? "Hom nay!" : `Con ${Math.ceil((new Date(deadline) - now) / (1000 * 60 * 60 * 24))} ngay`}
            </Typography>
          )}
        </Box>
        <Chip
          label={isPast ? "Qua han" : status || (isToday ? "Den han" : "Con han")}
          size="small"
          sx={{ bgcolor: alpha(accentColor, 0.15), color: accentColor, fontWeight: 700, fontSize: "0.65rem" }}
        />
      </Stack>
    </Box>
  );
}

function ScoreBreakdownDialog({ open, onClose, studentName, scores, finalScore }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "white" }}>
        Chi tiết điểm: {studentName}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {Object.entries(scores || {}).map(([role, sc]) => (
            <Box key={role} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "#334155" }}>
                {role === "GVHD" ? "GV Hướng dẫn" : role === "GVPB" ? "GV Phản biện" : role === "CHUTICH" ? "Chủ tịch HĐ" : role === "THUKY" ? "Thư ký" : role}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <ScoreChip score={sc?.score} />
                <Typography variant="caption" sx={{ color: "#475569", flex: 1, lineHeight: 1.5 }}>
                  {sc?.comment || "Chưa có nhận xét"}
                </Typography>
              </Stack>
            </Box>
          ))}
          {finalScore && (
            <Box sx={{ p: 2.5, borderRadius: 2, border: "2px solid #059669", bgcolor: alpha("#059669", 0.05) }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: "#059669" }}>Điểm cuoi cung</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#059669" }}>{finalScore}</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>Dong</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function StudentTimelinePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { dashboard, loading } = useSelector((s) => s.registration);
  const [scoreDialog, setScoreDialog] = useState({ open: false, studentName: "", scores: {}, finalScore: null });
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    dispatch(loadStudentDashboard(user.email));
  }, [dispatch, user.email]);

  const registrations = dashboard?.registrations || [];
  const submissions = dashboard?.submissions || [];
  const councils = dashboard?.councils || [];
  const studentStatus = dashboard?.student?.status || "NEW";

  const bcttReg = registrations.find((r) => r.type === "BCTT");
  const kltnReg = registrations.find((r) => r.type === "KLTN");
  const bcttSub = submissions.find((s) => s.type === "BCTT");
  const kltnSub = submissions.find((s) => s.type === "KLTN");
  const revisionSub = submissions.find((s) => s.type === "KLTN_REVISION");

  const totalSubmitted = submissions.filter((s) => s.file).length;
  const totalScore = submissions.filter((s) => s.score !== undefined && s.score !== null && s.score !== "").reduce((sum, s) => sum + Number(s.score), 0);
  const avgScore = totalSubmitted > 0 ? (totalScore / totalSubmitted).toFixed(1) : null;

  async function openScoreDetail(council) {
    setDetailLoading(true);
    setScoreDialog({ open: true, studentName: council.studentName || user.name, scores: council.scores || {}, finalScore: council.finalScore || null });
    setDetailLoading(false);
  }

  // Build dynamic timeline
  const timelineItems = [
    { step: 1, label: "Khởi tạo tài khoản", desc: "Tài khoản đã được tạo và duyệt bởi quản trị viên", status: "done" },
    { step: 2, label: "Đăng ký BCTT", desc: `Đề tài: ${bcttReg?.topic || "Chưa đăng ký"} | GVHD: ${bcttReg?.lecturer || "Chưa phân công"}`, status: bcttReg?.status === "APPROVED" ? "done" : bcttReg ? "active" : "pending" },
    { step: 3, label: "Hoàn thành BCTT", desc: bcttSub?.file ? `Đã nộp - Điểm: ${bcttSub?.score || "Chưa chấm"}` : "Chưa nộp báo cáo", status: bcttSub?.status === "PASSED" ? "done" : bcttSub?.file ? "active" : "pending" },
    { step: 4, label: "Đăng ký KLTN", desc: kltnReg ? `Đề tài: ${kltnReg.topic}` : "Chưa đăng ký KLTN", status: kltnReg?.status === "APPROVED" ? "done" : kltnReg ? "active" : "pending" },
    { step: 5, label: "Phân công hội đồng", desc: councils.length > 0 ? "Đã phân công GVHD, GVPB, Chủ tịch" : "Đang chờ phân công", status: councils.length > 0 ? "done" : "pending" },
    { step: 6, label: "Nộp KLTN", desc: kltnSub?.file ? "Đã nộp bài KLTN" : "Chưa nộp KLTN", status: kltnSub?.file ? "done" : "pending" },
    { step: 7, label: "Bảo vệ", desc: councils.length > 0 && councils[0].date ? `Ngay: ${councils[0].date} - Địa điểm: ${councils[0].location || "Chưa xác định"}` : "Chưa có lịch bảo vệ", status: councils[0]?.councilStatus === "DEFENDED" ? "done" : councils.length > 0 ? "active" : "pending" },
    { step: 8, label: "Nhận điểm cuối cùng", desc: avgScore ? `Điểm TB: ${avgScore}` : "Đang chờ kết quả", status: avgScore ? "done" : "pending" }
  ];

  function getStatusColor(status) {
    if (status === "done") return "#059669";
    if (status === "active") return "#d97706";
    return "#94a3b8";
  }

  const TimelineNode = ({ item, isLast }) => (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Stack direction="column" alignItems="center">
        <Box sx={{
          width: 40, height: 40, borderRadius: "50%",
          bgcolor: alpha(getStatusColor(item.status), 0.1),
          border: `2px solid ${getStatusColor(item.status)}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          transition: "all 0.2s"
        }}>
          {item.status === "done" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={getStatusColor(item.status)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : item.status === "active" ? (
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: getStatusColor(item.status) }} />
          ) : (
            <Typography variant="caption" sx={{ fontWeight: 800, color: getStatusColor(item.status), fontSize: "0.75rem" }}>{item.step}</Typography>
          )}
        </Box>
        {!isLast && (
          <Box sx={{ width: 2, flex: 1, minHeight: 28, bgcolor: item.status === "done" ? "#059669" : "#e2e8f0", my: 0.5, borderRadius: 1, transition: "background 0.3s" }} />
        )}
      </Stack>
      <Box sx={{ pb: isLast ? 0 : 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: item.status === "done" ? "#0f172a" : item.status === "active" ? "#b45309" : "#64748b", lineHeight: 1.3 }}>
          {item.label}
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
          {item.desc}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}

      {/* Header */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            title="Tien trinh hoan thanh KLTN"
            subtitle="Theo dõi tất cả các bước từ khởi tạo đến bảo vệ"
            gradient={GRADIENT}
            color={COLOR}
          />
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack spacing={0}>
                {timelineItems.map((item, idx) => (
                  <TimelineNode key={item.step} item={item} isLast={idx === timelineItems.length - 1} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {/* Status summary */}
                <Box sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>Trang thai cua ban</Typography>
                  <StudentStatusChip status={studentStatus} />
                </Box>

                {/* Quick stats */}
                <Box sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>Thống kê</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: "Đề tài đã ĐK", value: registrations.length, color: "#7c3aed" },
                      { label: "File đã nộp", value: submissions.filter((s) => s.file).length, color: "#059669" },
                      { label: "Điểm TB", value: avgScore || "—", color: avgScore ? (Number(avgScore) >= 8 ? "#059669" : Number(avgScore) >= 5 ? "#d97706" : "#dc2626") : "#1e40af" }
                    ].map(({ label, value, color }) => (
                      <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color, fontSize: "0.9375rem" }}>{value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* Deadlines */}
                {dashboard?.periods && dashboard.periods.length > 0 && (
                  <Box sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>Han deadline</Typography>
                    <Stack spacing={1}>
                      {dashboard.periods.map((p, i) => (
                        <DeadlineCard key={i} label={p.name || p.dot || `Dot ${i + 1}`} deadline={p.kltnDeadline} status={kltnSub?.file ? "Đã nộp" : undefined} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Registration Details */}
      {(bcttReg || kltnReg) && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              title="Chi tiết đăng ký"
              subtitle="Thông tin đề tài và GV hướng dẫn"
              gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
              color="#7c3aed"
            />
            <Grid container spacing={2}>
              {bcttReg && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2.5, borderRadius: 2.5, border: `1.5px solid ${alpha("#7c3aed", 0.2)}`, bgcolor: alpha("#7c3aed", 0.03) }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#7c3aed" }}>BCTT</Typography>
                      <Chip label={bcttReg.status === "APPROVED" ? "Đã duyệt" : bcttReg.status === "REJECTED" ? "Từ chối" : "Chờ duyệt"} size="small" sx={{ bgcolor: alpha(bcttReg.status === "APPROVED" ? "#059669" : bcttReg.status === "REJECTED" ? "#dc2626" : "#d97706", 0.1), color: bcttReg.status === "APPROVED" ? "#059669" : bcttReg.status === "REJECTED" ? "#dc2626" : "#d97706", fontWeight: 700, fontSize: "0.7rem" }} />
                    </Stack>
                    <Stack spacing={1}>
                      {[
                        { label: "De tai", value: bcttReg.topic || "—" },
                        { label: "Lĩnh vực", value: bcttReg.field || "—" },
                        { label: "GVHD", value: bcttReg.lecturer || "—" },
                        { label: "Dot", value: bcttReg.dot || "—" }
                      ].map(({ label, value }) => (
                        <Stack key={label} direction="row" spacing={1}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", minWidth: 70 }}>{label}:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#0f172a", flex: 1 }}>{value}</Typography>
                        </Stack>
                      ))}
                      {bcttSub && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", minWidth: 70 }}>Bài nộp:</Typography>
                          <ScoreChip score={bcttSub.score} />
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              )}
              {kltnReg && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2.5, borderRadius: 2.5, border: `1.5px solid ${alpha("#dc2626", 0.2)}`, bgcolor: alpha("#dc2626", 0.03) }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#dc2626" }}>KLTN</Typography>
                      <Chip label={kltnReg.status === "APPROVED" ? "Đã duyệt" : kltnReg.status === "REJECTED" ? "Từ chối" : "Chờ duyệt"} size="small" sx={{ bgcolor: alpha(kltnReg.status === "APPROVED" ? "#059669" : kltnReg.status === "REJECTED" ? "#dc2626" : "#d97706", 0.1), color: kltnReg.status === "APPROVED" ? "#059669" : kltnReg.status === "REJECTED" ? "#dc2626" : "#d97706", fontWeight: 700, fontSize: "0.7rem" }} />
                    </Stack>
                    <Stack spacing={1}>
                      {[
                        { label: "De tai", value: kltnReg.topic || "—" },
                        { label: "Lĩnh vực", value: kltnReg.field || "—" },
                        { label: "GVHD", value: kltnReg.lecturer || "—" },
                        { label: "Dot", value: kltnReg.dot || "—" }
                      ].map(({ label, value }) => (
                        <Stack key={label} direction="row" spacing={1}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", minWidth: 70 }}>{label}:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#0f172a", flex: 1 }}>{value}</Typography>
                        </Stack>
                      ))}
                      {kltnSub && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", minWidth: 70 }}>Bài nộp:</Typography>
                          <ScoreChip score={kltnSub.score} />
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Council Info & Scores */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            title="Thông tin hội đồng bảo vệ"
            subtitle="Lịch sử, địa điểm, thành viên và điểm chi tiết"
            gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
            color="#7c3aed"
          />
          {councils.length === 0 ? (
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b" }}>Chưa có lịch hội đồng</Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>Hoi dong bao ve se duoc thong bao khi TBM phan cong</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {councils.map((c, idx) => (
                <Box key={idx} sx={{ p: 3, borderRadius: 2.5, border: `1.5px solid ${alpha("#7c3aed", 0.2)}`, bgcolor: alpha("#7c3aed", 0.02) }}>
                  {/* Council header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#7c3aed", mb: 0.5 }}>Hoi dong #{idx + 1}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={c.councilStatus === "DEFENDED" ? "Đã bảo vệ" : "Chờ bảo vệ"} size="small" sx={{ bgcolor: alpha(c.councilStatus === "DEFENDED" ? "#059669" : "#d97706", 0.1), color: c.councilStatus === "DEFENDED" ? "#059669" : "#d97706", fontWeight: 700, fontSize: "0.7rem" }} />
                        {c.date && <Chip label={c.date} size="small" sx={{ bgcolor: alpha("#0891b2", 0.1), color: "#0891b2", fontWeight: 700, fontSize: "0.7rem" }} />}
                        {c.location && <Chip label={c.location} size="small" sx={{ bgcolor: alpha("#64748b", 0.1), color: "#64748b", fontWeight: 700, fontSize: "0.7rem" }} />}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {Object.entries(c.scores || {}).map(([role, sc]) => (
                        <ScoreChip key={role} score={sc?.score} label={role === "GVHD" ? "HD" : role === "GVPB" ? "PB" : role === "CHUTICH" ? "CT" : role} />
                      ))}
                      {c.finalScore && (
                        <ScoreChip score={c.finalScore} label="TB" />
                      )}
                    </Stack>
                  </Stack>

                  {/* Members */}
                  <Grid container spacing={2} mb={2}>
                    {[
                      { label: "GVHD", value: c.gvhd },
                      { label: "GVPB", value: c.gvpb },
                      { label: "Chu tich", value: c.chairman },
                      { label: "Thu ky", value: c.secretary }
                    ].map(({ label, value }) => value && (
                      <Grid item xs={6} sm={3} key={label}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", display: "block", mb: 0.25 }}>{label}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8rem" }}>{value}</Typography>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Score summary + detail button */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {c.finalScore && (
                      <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc", textAlign: "center" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.65rem" }}>DIEM CUOI CUNG</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: Number(c.finalScore) >= 8 ? "#059669" : Number(c.finalScore) >= 5 ? "#d97706" : "#dc2626" }}>{c.finalScore}</Typography>
                      </Box>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openScoreDetail(c)}
                      startIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Xem chi tiết điểm
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Revision Status */}
      {revisionSub && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
              title="Trang thai chinh sua sau bao ve"
              subtitle="Bai KLTN da chinh sua theo y kien hoi dong"
              gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
              color="#059669"
            />
            <Box sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b" }}>File đã nộp:</Typography>
                  <Chip label={revisionSub.file ? "Đã nộp" : "Chưa nộp"} size="small" sx={{ bgcolor: alpha(revisionSub.file ? "#059669" : "#94a3b8", 0.1), color: revisionSub.file ? "#059669" : "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />
                </Stack>
                {revisionSub.status && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b" }}>Trạng thái duyệt:</Typography>
                    <StudentStatusChip status={revisionSub.status} />
                  </Stack>
                )}
              </Stack>
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha("#d97706", 0.05), border: "1px solid rgba(217,119,6,0.2)" }}>
                <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600 }}>
                  Quy trình: SV nộp bài chỉnh sửa → GVHD duyệt → Chủ tịch Hội đồng duyệt → Hoàn thành
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            title="Lịch sử hoạt động"
            subtitle="Tat ca cac hanh dong cua ban trong he thong"
            gradient="linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)"
            color="#0f766e"
          />
          <List disablePadding>
            {registrations.length === 0 && submissions.length === 0 && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>Chưa có hoạt động nào</Typography>
              </Box>
            )}
            {registrations.map((r) => (
              <ListItem key={`r-${r.id}`} sx={{ px: 0 }}>
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
                      <Chip label={r.status === "APPROVED" ? "Đã duyệt" : r.status === "REJECTED" ? "Đã từ chối" : "Chờ duyệt"} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: alpha(r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#d97706", 0.1), color: r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#d97706" }} />
                    </Stack>
                  }
                  secondary={<Typography variant="caption" sx={{ color: "#64748b" }}>Dot: {r.dot || "—"} | GVHD: {r.lecturer || "—"}</Typography>}
                />
              </ListItem>
            ))}
            {submissions.map((s) => (
              <ListItem key={`s-${s.type}`} sx={{ px: 0 }}>
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
        </CardContent>
      </Card>

      <ScoreBreakdownDialog
        open={scoreDialog.open}
        onClose={() => setScoreDialog((d) => ({ ...d, open: false }))}
        studentName={scoreDialog.studentName}
        scores={scoreDialog.scores}
        finalScore={scoreDialog.finalScore}
      />
    </Stack>
  );
}
