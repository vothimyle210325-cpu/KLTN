import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const StatCard = ({ icon, label, value, gradient, color, subtitle }) => (
  <Card sx={{ borderRadius: 3, overflow: "hidden", height: "100%" }}>
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
            "& svg": { color: "white", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.08em", display: "block", mb: 0.25 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1.1, mb: 0.25 }}>
            {value ?? "—"}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const SectionCard = ({ icon, title, subtitle, children, gradient, accent }) => (
  <Card sx={{ borderRadius: 3, overflow: "hidden", mb: 2.5 }}>
    <Box sx={{ px: 3, py: 2, background: gradient || "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1.5 }}>
      {icon && (
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: gradient ? "rgba(255,255,255,0.3)" : alpha(accent || "#1e40af", 0.1), display: "flex", alignItems: "center", justifyContent: "center", "& svg": { color: accent || "#1e40af" } }}>
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Card>
);

const RoleSection = ({ role, user }) => {
  const gradient = role === "SV"
    ? "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
    : role === "GV" || role === "THUKY" || role === "CHUTICH"
      ? "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
      : "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";
  const color = role === "SV" ? "#0284c7" : role === "GV" || role === "THUKY" || role === "CHUTICH" ? "#7c3aed" : "#1e40af";

  const [stats, setStats] = useState({});
  const [sysStats, setSysStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const action = role === "SV"
      ? "getStudentDashboard"
      : role === "TBM" || role === "ADMIN"
        ? "getTBMDashboard"
        : "getGuidanceList";

    const payload = role === "GV" || role === "THUKY" || role === "CHUTICH"
      ? { email: user.email, role }
      : { email: user.email };

    Promise.all([
      callApi(action, payload),
      role === "TBM" || role === "ADMIN" ? callApi("getStatistics") : Promise.resolve({ ok: false })
    ]).then(([dashRes, statRes]) => {
      if (dashRes.ok) setStats(dashRes.data || {});
      if (statRes.ok) setSysStats(statRes.data || null);
      setLoading(false);
    });
  }, [role, user.email]);

  const roleGradient = `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`;

  const guidanceList = Array.isArray(stats) ? stats : [];
  const dash = Array.isArray(stats) ? {} : stats || {};
  const regs = dash.registrations || [];
  const subs = dash.submissions || [];
  const studs = dash.students || [];
  const coun = dash.councils || [];
  const revisions = dash.revisions || [];

  const svBctt = regs.filter((r) => r.type === "BCTT").length;
  const svKltn = regs.filter((r) => r.type === "KLTN").length;
  const svPending = regs.filter((r) => r.status === "PENDING").length;
  const svRevPending = revisions.filter(
    (r) => r.gvhdApproval === "PENDING" || r.chairmanApproval === "PENDING"
  ).length;

  const gvApproved = guidanceList.filter((s) => s.status === "APPROVED").length;
  const gvBctt = guidanceList.filter((s) => s.type === "BCTT").length;
  const gvKltn = guidanceList.filter((s) => s.type === "KLTN").length;
  const gvScored = guidanceList.filter((s) => {
    const m = s.myScore;
    return m && m.score !== undefined && m.score !== null && String(m.score).trim() !== "";
  }).length;
  const gvUnscored = Math.max(0, guidanceList.length - gvScored);

  const tbmStudents = studs.length;
  const tbmSubs = dash.submissions?.length ?? 0;
  const tbmAvg = sysStats?.avgScore ?? "—";
  const tbmRevPen = sysStats?.revisionStats?.pending ?? 0;

  return (
    <Stack spacing={2.5}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}

      <Grid container spacing={2}>
        {role === "SV" && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                label="Đề tài đã đăng ký"
                value={regs.length || 0}
                gradient={gradient}
                color={color}
                subtitle="Tổng số đề tài"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                label="File đã nộp"
                value={subs.length || 0}
                gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
                color="#059669"
                subtitle="Tap tin PDF"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                label="Trạng thái"
                value={dash.student?.status || "NEW"}
                gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                color="#d97706"
                subtitle="Hoc phan hien tai"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                label="Hoc ky"
                value="2026-1"
                gradient="linear-gradient(135deg, #475569 0%, #64748b 100%)"
                color="#475569"
                subtitle="Ky hien tai"
              />
            </Grid>
          </>
        )}

        {(role === "GV" || role === "THUKY" || role === "CHUTICH") && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                label="Sinh viên HD"
                value={guidanceList.length}
                gradient={gradient}
                color={color}
                subtitle="Theo danh sách phân công"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                label="Điểm da cham"
                value={gvScored}
                gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
                color="#059669"
                subtitle="Đã nhập điểm"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                label="Chờ duyệt đề tài"
                value={guidanceList.filter((s) => s.status === "PENDING").length}
                gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                color="#d97706"
                subtitle="PENDING"
              />
            </Grid>
          </>
        )}

        {(role === "TBM" || role === "ADMIN") && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>}
                label="Tổng đề tài"
                value={regs.length || 0}
                gradient={gradient}
                color={color}
                subtitle="Đăng ký học kỳ nay"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                label="Chờ duyệt"
                value={regs.filter((r) => r.status === "PENDING").length || 0}
                gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                color="#d97706"
                subtitle="PENDING"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                label="Đã duyệt"
                value={regs.filter((r) => r.status === "APPROVED").length || 0}
                gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
                color="#059669"
                subtitle="APPROVED"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                label="Giảng viên"
                value={dash.lecturers?.length || 0}
                gradient="linear-gradient(135deg, #475569 0%, #64748b 100%)"
                color="#475569"
                subtitle="Hoat dong"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Info card */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{
          background: roleGradient,
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2
        }}>
          <Avatar
            sx={{
              width: 56, height: 56,
              fontWeight: 800,
              fontSize: "1.25rem",
              bgcolor: "rgba(255,255,255,0.25)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(8px)"
            }}
          >
            {(user.name || user.email).charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>
              {user.name || user.email}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              {user.email}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, display: "block", mt: 0.25 }}>
              Hoc ky 2026-1
            </Typography>
          </Box>
        </Box>
      </Card>

      <SectionCard
        title="Thống kê chi tiết"
        subtitle="Số liệu bổ sung theo vai trò của bạn"
        accent={color}
      >
        <Grid container spacing={2}>
          {role === "SV" && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                  label="Đăng ký BCTT"
                  value={svBctt}
                  gradient="linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
                  color="#0284c7"
                  subtitle="Theo loại đề tài"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                  label="Đăng ký KLTN"
                  value={svKltn}
                  gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
                  color="#7c3aed"
                  subtitle="Theo loại đề tài"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  label="Chờ duyệt đề tài"
                  value={svPending}
                  gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                  color="#d97706"
                  subtitle="Trạng thái PENDING"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                  label="Bản sửa chờ duyệt"
                  value={svRevPending}
                  gradient="linear-gradient(135deg, #475569 0%, #64748b 100%)"
                  color="#475569"
                  subtitle="GVHD / Chủ tịch"
                />
              </Grid>
            </>
          )}
          {(role === "GV" || role === "THUKY" || role === "CHUTICH") && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  label="Đề tài đã duyệt"
                  value={gvApproved}
                  gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
                  color="#059669"
                  subtitle="APPROVED"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                  label="Sinh viên BCTT"
                  value={gvBctt}
                  gradient="linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
                  color="#0284c7"
                  subtitle="Trong danh sách HD"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                  label="Sinh viên KLTN"
                  value={gvKltn}
                  gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
                  color="#7c3aed"
                  subtitle="Trong danh sách HD"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                  label="Chưa nhập điểm"
                  value={gvUnscored}
                  gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                  color="#d97706"
                  subtitle="Cần chấm (vai trò của bạn)"
                />
              </Grid>
            </>
          )}
          {(role === "TBM" || role === "ADMIN") && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                  label="Điểm TB KLTN"
                  value={tbmAvg}
                  gradient={gradient}
                  color={color}
                  subtitle="Theo bảng điểm hệ thống"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                  label="Sinh viên (hồ sơ)"
                  value={tbmStudents}
                  gradient="linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
                  color="#0284c7"
                  subtitle="Sheet STUDENTS"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  label="Bài nộp (PDF)"
                  value={tbmSubs}
                  gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
                  color="#059669"
                  subtitle="Tổng submission"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>}
                  label="Bản sửa chờ duyệt"
                  value={tbmRevPen}
                  gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                  color="#d97706"
                  subtitle="REVISIONS pending"
                />
              </Grid>
            </>
          )}
        </Grid>
      </SectionCard>
    </Stack>
  );
};

export default function DashboardPage({ user }) {
  return (
    <Box>
      <RoleSection role={user.role} user={user} />
    </Box>
  );
}
