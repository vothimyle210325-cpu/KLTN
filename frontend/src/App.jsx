import { Suspense, lazy, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { logout } from "./features/authSlice";
import { HcmuteLogo, HCMUTE_BRAND } from "./components/HcmuteLogo";

// Lazy page imports
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LecturerPage = lazy(() => import("./pages/LecturerPage"));
const ApprovalsPage = lazy(() => import("./pages/ApprovalsPage"));
const CouncilPage = lazy(() => import("./pages/CouncilPage"));
const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const LecturerMgmtPage = lazy(() => import("./pages/LecturerMgmtPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const StudentRegPage = lazy(() => import("./pages/student/StudentRegPage"));
const StudentUploadPage = lazy(() => import("./pages/student/StudentUploadPage"));
const StudentTimelinePage = lazy(() => import("./pages/student/StudentTimelinePage"));
const TopicSuggestionPage = lazy(() => import("./pages/TopicSuggestionPage"));
const RevisionApprovalPage = lazy(() => import("./pages/RevisionApprovalPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const ChairmanPage = lazy(() => import("./pages/ChairmanPage"));
const SecretaryPage = lazy(() => import("./pages/SecretaryPage"));
const PeriodsPage = lazy(() => import("./pages/PeriodsPage"));

const DRAWER_WIDTH = 260;

// SVG Icons
const ICONS = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  registration: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  timeline: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  lecturer: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  approvals: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  council: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  accounts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  admin: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  notification: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  suggest: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  stats: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  period: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  revision: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  chairman: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  secretary: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
};

const NAV_MAP = {
  SV: [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "registration", label: "Đăng ký đề tài", icon: "registration" },
    { id: "upload", label: "Nộp bài tập", icon: "upload" },
    { id: "timeline", label: "Theo dõi trạng thái", icon: "timeline" },
    { id: "topicsuggest", label: "Gợi ý đề tài", icon: "suggest" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "profile" }
  ],
  GV: [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "lecturer", label: "Quản lý chấm điểm", icon: "lecturer" },
    { id: "topicsuggest", label: "Gợi ý đề tài", icon: "suggest" },
    { id: "revision", label: "Duyệt chỉnh sửa", icon: "revision" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "profile" }
  ],
  THUKY: [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "lecturer", label: "Quản lý chấm điểm", icon: "lecturer" },
    { id: "secretary", label: "Thư ký HĐ", icon: "secretary" },
    { id: "topicsuggest", label: "Gợi ý đề tài", icon: "suggest" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "profile" }
  ],
  CHUTICH: [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "lecturer", label: "Quản lý chấm điểm", icon: "lecturer" },
    { id: "chairman", label: "Chủ tịch HĐ", icon: "chairman" },
    { id: "topicsuggest", label: "Gợi ý đề tài", icon: "suggest" },
    { id: "revision", label: "Duyệt chỉnh sửa", icon: "revision" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "profile" }
  ],
  TBM: [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "approvals", label: "Duyệt đề tài", icon: "approvals" },
    { id: "council", label: "Phân công hội đồng", icon: "council" },
    { id: "lecturers", label: "Quản lý GV", icon: "lecturer" },
    { id: "accounts", label: "Quản lý tài khoản", icon: "accounts" },
    { id: "statistics", label: "Thống kê", icon: "stats" },
    { id: "periods", label: "Quản lý đợt", icon: "period" },
    { id: "topicsuggest", label: "Gợi ý đề tài", icon: "suggest" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "profile" }
  ],
  ADMIN: [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "admin", label: "Quản trị hệ thống", icon: "admin" },
    { id: "approvals", label: "Duyệt đề tài", icon: "approvals" },
    { id: "council", label: "Phân công hội đồng", icon: "council" },
    { id: "lecturers", label: "Quản lý GV", icon: "lecturer" },
    { id: "accounts", label: "Quản lý tài khoản", icon: "accounts" },
    { id: "statistics", label: "Thống kê", icon: "stats" },
    { id: "periods", label: "Quản lý đợt", icon: "period" },
    { id: "topicsuggest", label: "Gợi ý đề tài", icon: "suggest" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "profile" }
  ]
};

const ROLE_CONFIG = {
  SV: { label: "Sinh viên", color: "#0284c7", gradient: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)" },
  GV: { label: "Giảng viên", color: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" },
  THUKY: { label: "Thư ký HĐ", color: "#059669", gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)" },
  CHUTICH: { label: "Chủ tịch HĐ", color: "#059669", gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)" },
  TBM: { label: "Trưởng bộ môn", color: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" },
  ADMIN: { label: "Quản trị", color: "#dc2626", gradient: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)" }
};

const PAGE_TITLES = {
  dashboard: "Tổng quan",
  registration: "Đăng ký đề tài",
  upload: "Nộp bài tập",
  timeline: "Theo dõi trạng thái",
  lecturer: "Quản lý chấm điểm",
  approvals: "Duyệt đề tài",
  council: "Phân công hội đồng",
  accounts: "Quản lý tài khoản",
  lecturers: "Quản lý giảng viên",
  profile: "Hồ sơ cá nhân",
  admin: "Quản trị hệ thống",
  topicsuggest: "Gợi ý đề tài",
  statistics: "Thống kê",
  periods: "Quản lý đợt",
  chairman: "Chủ tịch Hội đồng",
  secretary: "Thư ký Hội đồng",
  revision: "Duyệt chỉnh sửa"
};

const SuspenseFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
    <Stack spacing={2} alignItems="center">
      <Box sx={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#1e40af", animation: "spin 0.8s linear infinite", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
      <Typography sx={{ color: "#94a3b8", fontWeight: 600 }}>Đang tải trang…</Typography>
    </Stack>
  </Box>
);

function App() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [authView, setAuthView] = useState("login");

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.SV;
  const navItems = NAV_MAP[user?.role] || NAV_MAP.SV;
  const defaultPage = navItems[0]?.id || "dashboard";
  const [activePage, setActivePage] = useState(defaultPage);

  const userInitials = useMemo(() => {
    if (!user?.name) return "?";
    return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }, [user]);

  if (!user) {
    return (
      <Suspense fallback={<Box sx={{ p: 3 }}><Alert severity="info">Đang tải…</Alert></Box>}>
        {authView === "login" ? (
          <LoginPage onOpenRegister={() => setAuthView("register")} />
        ) : (
          <RegisterPage onBackToLogin={() => setAuthView("login")} onSuccess={() => setAuthView("login")} />
        )}
      </Suspense>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage user={user} />;
      case "registration": return <StudentRegPage />;
      case "upload": return <StudentUploadPage />;
      case "timeline": return <StudentTimelinePage />;
      case "lecturer": return <LecturerPage />;
      case "approvals": return <ApprovalsPage />;
      case "council": return <CouncilPage />;
      case "accounts": return <AccountsPage />;
      case "lecturers": return <LecturerMgmtPage />;
      case "profile": return <ProfilePage />;
      case "admin": return <AdminPage />;
      case "topicsuggest": return <TopicSuggestionPage />;
      case "statistics": return <StatisticsPage />;
      case "chairman": return <ChairmanPage />;
      case "secretary": return <SecretaryPage />;
      case "revision": return <RevisionApprovalPage />;
      case "periods": return <PeriodsPage />;
      default: return <DashboardPage user={user} />;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* === SIDEBAR === */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            overflow: "hidden",
            // Layout theo cột để nút "Đăng xuat" luôn nằm ở đáy.
            display: "flex",
            flexDirection: "column",
            height: "100vh"
          }
        }}
      >
        {/* Brand */}
        <Box sx={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
          p: 3, minHeight: 80,
          display: "flex", alignItems: "center", gap: 1.5
        }}>
          <HcmuteLogo height={48} onDarkBackground sx={{ flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2, fontSize: "0.95rem" }}>
              KLTN Portal
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.68rem", display: "block", lineHeight: 1.35 }}>
              {HCMUTE_BRAND.short} — 2026
            </Typography>
          </Box>
        </Box>

        {/* User card */}
        <Box sx={{ mx: 2, my: 2, p: 1.5, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 40, height: 40, fontWeight: 800, fontSize: "0.875rem", background: roleConfig.gradient }}>
              {userInitials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={user.name || user.email} placement="right">
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.3, fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default" }}>
                  {user.name || user.email}
                </Typography>
              </Tooltip>
              <Typography variant="caption" sx={{ color: roleConfig.color, fontWeight: 600, fontSize: "0.68rem" }}>
                {roleConfig.label}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mx: 2 }} />
        <Typography variant="overline" sx={{ px: 3, pt: 1.5, pb: 0.5, color: "#94a3b8", fontSize: "0.62rem" }}>
          Menu chính
        </Typography>

        {/* Navigation */}
        <Box sx={{ px: 1, py: 0.5, flex: 1, overflowY: "auto" }}>
          <List disablePadding>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activePage === item.id}
                  onClick={() => setActivePage(item.id)}
                  sx={{
                    borderRadius: 2.5,
                    mx: 0.5, mb: 0.5,
                    py: 1.25, px: 1.5,
                    transition: "all 0.15s",
                    "&.Mui-selected": {
                      bgcolor: alpha(roleConfig.color, 0.1),
                      color: roleConfig.color,
                      "& .MuiListItemIcon-root": { color: roleConfig.color },
                      "&:hover": { bgcolor: alpha(roleConfig.color, 0.14) }
                    },
                    "&:hover": { bgcolor: alpha(roleConfig.color, 0.05) }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                    {ICONS[item.icon]}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: activePage === item.id ? 700 : 500,
                      color: "inherit"
                    }}
                  />
                  {activePage === item.id && (
                    <Box sx={{ width: 4, height: 20, borderRadius: 2, background: roleConfig.gradient, flexShrink: 0 }} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ mx: 2 }} />

        {/* Bottom section */}
        <Box sx={{ px: 1, py: 1, mb: 1, mt: "auto", flexShrink: 0 }}>
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => dispatch(logout())}
                sx={{
                  borderRadius: 2.5, mx: 0.5, mb: 0.5, py: 1.25, px: 1.5,
                  color: "#dc2626",
                  "&:hover": { bgcolor: alpha("#dc2626", 0.06) }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{ICONS.logout}</ListItemIcon>
                <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 600, color: "inherit" }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* === MAIN === */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "white", color: "text.primary", borderBottom: "1px solid #e2e8f0", zIndex: 1100 }}>
          <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: "60px !important" }}>
            <Box sx={{ flex: 1 }}>
              <Breadcrumbs sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1} component="span">
                  <HcmuteLogo height={22} sx={{ flexShrink: 0 }} />
                  <Link underline="hover" color="text.secondary" href="#" sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                    KLTN Portal
                  </Link>
                </Stack>
                <Typography color="text.primary" sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                  {PAGE_TITLES[activePage] || "Tổng quan"}
                </Typography>
              </Breadcrumbs>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: alpha(roleConfig.color, 0.08), border: `1px solid ${alpha(roleConfig.color, 0.2)}` }}>
                <Typography variant="caption" sx={{ color: roleConfig.color, fontWeight: 700, fontSize: "0.7rem" }}>
                  {roleConfig.label}
                </Typography>
              </Box>
              <Avatar sx={{ width: 36, height: 36, fontSize: "0.8125rem", fontWeight: 800, background: roleConfig.gradient }}>
                {userInitials}
              </Avatar>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Suspense fallback={<SuspenseFallback />}>
            {renderPage()}
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
