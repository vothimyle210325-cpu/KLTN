import { useEffect, useState } from "react";
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
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const ACCENT = "#1e40af";
const GRADIENT = "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";

const SectionHeader = ({ icon, title, subtitle, gradient, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: 2,
      background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
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

const StatusChip = ({ status }) => {
  const map = {
    PENDING: { label: "Chờ duyệt", color: "#d97706" },
    APPROVED: { label: "Đã duyệt", color: "#059669" },
    REJECTED: { label: "Đã từ chối", color: "#dc2626" },
    NEW: { label: "Mới", color: "#0284c7" }
  };
  const c = map[status] || map.NEW;
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{
        bgcolor: alpha(c.color, 0.1), color: c.color,
        border: `1px solid ${alpha(c.color, 0.25)}`,
        fontWeight: 700, fontSize: "0.7rem", height: 22
      }}
    />
  );
};

function HODPage() {
  const [data, setData] = useState({ lecturers: [], registrations: [], stats: [], pendingUsers: [], audits: [] });
  const [message, setMessage] = useState("");
  const [assignments, setAssignments] = useState({});
  const [regFilter, setRegFilter] = useState({ keyword: "", status: "ALL" });
  const [userFilter, setUserFilter] = useState({ keyword: "", status: "ALL" });
  const [loading, setLoading] = useState(false);
  const [colModel, setColModel] = useState({ type: true, lecturer: true, status: true, dot: true });

  async function load() {
    setLoading(true);
    const res = await callApi("getTBMDashboard");
    if (res.ok) setData(res.data || {});
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openSlots() {
    const res = await callApi("openLecturerSlots", { by: "tbm", role: "TBM" });
    if (res.ok) { setMessage("Đã mở slot đăng ký!"); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function updateReg(id, status) {
    const res = await callApi("updateRegistrationStatus", { id, status, by: "tbm", role: "TBM" });
    if (res.ok) { setMessage(status === "APPROVED" ? "Đã duyệt đề tài!" : "Đã từ chối đề tài."); load(); }
    else setMessage(res.message || "Lỗi cập nhật");
  }

  async function bulkApprove() {
    const ids = pendingRegs.map((x) => x.id);
    if (!ids.length) return;
    const res = await callApi("approveRegistrationsBulk", { ids, status: "APPROVED", by: "tbm", role: "TBM" });
    if (res.ok) { setMessage(`Đã duyệt ${ids.length} hồ sơ PENDING!`); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function approveUser(email) {
    const res = await callApi("approveUser", { email, status: "APPROVED", by: "admin", role: "ADMIN" });
    if (res.ok) { setMessage(`Đã duyệt: ${email}`); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function rejectUser(email) {
    const res = await callApi("rejectUser", { email, status: "REJECTED", by: "admin", role: "ADMIN" });
    if (res.ok) { setMessage(`Đã từ chối: ${email}`); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function assignCouncil(student) {
    const v = assignments[student] || {};
    const res = await callApi("assignCouncil", {
      student, by: "tbm", role: "TBM",
      gvhd: v.gvhd || "", gvpb: v.gvpb || "",
      chairman: v.chairman || "", date: v.date || "", location: v.location || ""
    });
    if (res.ok) { setMessage("Đã lưu phân công hội đồng!"); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sortedRegs);
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "tbm-registrations.xlsx");
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Sinh viên", "Loại", "Đề tài", "Giảng viên", "Trạng thái", "Đợt"]],
      body: sortedRegs.map((r) => [r.student, r.type, r.topic, r.lecturer, r.status, r.dot])
    });
    doc.save("tbm-registrations.pdf");
  }

  function exportAuditCsv() {
    const audits = data.audits || [];
    const rows = [["Thời gian", "Vai trò", "Tác giả", "Hành động", "Đối tượng", "Chi tiết"]];
    audits.forEach((a) => rows.push([a.ts, a.role, a.actor, a.action, a.target, a.detail]));
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const pendingRegs = (data.registrations || []).filter((r) => r.status === "PENDING");
  const lecturerEmails = (data.lecturers || []).map((l) => l.email);

  const filteredRegs = (data.registrations || []).filter((r) => {
    const term = regFilter.keyword.trim().toLowerCase();
    const hitKeyword = !term ||
      String(r.student || "").toLowerCase().includes(term) ||
      String(r.topic || "").toLowerCase().includes(term);
    const hitStatus = regFilter.status === "ALL" || String(r.status || "") === regFilter.status;
    return hitKeyword && hitStatus;
  });

  const approvedCount = (data.registrations || []).filter((r) => r.status === "APPROVED").length;
  const rejectedCount = (data.registrations || []).filter((r) => r.status === "REJECTED").length;
  const sortedRegs = [...filteredRegs].sort((a, b) => {
    const av = String(a.student || "").toLowerCase();
    const bv = String(b.student || "").toLowerCase();
    return av.localeCompare(bv) || String(a.topic || "").localeCompare(String(b.topic || ""));
  });

  const regRows = sortedRegs.map((r, idx) => ({ id: r.id || `${r.student}-${idx}`, ...r }));

  const auditRows = (data.audits || []).map((a, idx) => ({ id: `${a.ts}-${idx}`, ...a }));

  const pendingUsers = data.pendingUsers || [];
  const filteredUsers = pendingUsers.filter((u) => {
    const term = userFilter.keyword.trim().toLowerCase();
    const hit = !term ||
      String(u.email || "").toLowerCase().includes(term) ||
      String(u.name || "").toLowerCase().includes(term) ||
      String(u.mssv || "").toLowerCase().includes(term);
    const hitStatus = userFilter.status === "ALL" || String(u.status || "") === userFilter.status;
    return hit && hitStatus;
  });
  const userRows = filteredUsers.map((u, idx) => ({ id: `${u.email}-${idx}`, ...u }));
  const pendingUserCount = pendingUsers.filter((u) => u.status === "PENDING").length;

  const regColumns = [
    {
      field: "student", headerName: "Sinh viên", minWidth: 220, flex: 1,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", fontWeight: 800, background: GRADIENT }}>
            {(p.value || "?").charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography>
        </Stack>
      )
    },
    {
      field: "topic", headerName: "Đề tài", minWidth: 260, flex: 1.4,
      renderCell: (p) => (
        <Tooltip title={p.value || ""}>
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.value || "—"}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: "type", headerName: "Loại", width: 100,
      renderCell: (p) => (
        <Chip label={p.value} size="small" sx={{
          bgcolor: alpha(p.value === "KLTN" ? "#7c3aed" : "#0284c7", 0.1),
          color: p.value === "KLTN" ? "#7c3aed" : "#0284c7",
          fontWeight: 700, fontSize: "0.7rem", height: 22,
          border: `1px solid ${alpha(p.value === "KLTN" ? "#7c3aed" : "#0284c7", 0.2)}`
        }} />
      )
    },
    { field: "lecturer", headerName: "Giảng viên", minWidth: 200, flex: 1 },
    { field: "status", headerName: "Trạng thái", width: 130, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: "dot", headerName: "Đợt", width: 110 },
    {
      field: "action", headerName: "Hành động", minWidth: 200, sortable: false, filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.75}>
          <Button size="small" variant="contained" color="success" onClick={() => updateReg(p.row.id, "APPROVED")} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>
            Duyệt
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => updateReg(p.row.id, "REJECTED")} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>
            Từ chối
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && (
        <Alert severity={message.includes("Lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      {/* === STATS ROW === */}
      <Grid container spacing={2}>
        {[
          { label: "Tổng đề tài", value: data.registrations?.length || 0, color: ACCENT, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { label: "Chờ duyệt", value: pendingRegs.length, color: "#d97706", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: "Đã duyệt", value: approvedCount, color: "#059669", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Đã từ chối", value: rejectedCount, color: "#dc2626", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
          { label: "Giảng viên", value: data.lecturers?.length || 0, color: "#0284c7", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> }
        ].map(({ label, value, color, icon }) => (
          <Grid item xs={6} sm={4} md={2.4} key={label}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                    background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 6px 20px ${alpha(color, 0.25)}`,
                    "& svg": { color: "white" }
                  }}>
                    {icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* === SECTION 1: Lecturer Quota === */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems="flex-start" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                title="Quota giảng viên"
                subtitle={`${data.lecturers?.length || 0} giảng viên có thể hướng dẫn`}
                gradient={GRADIENT}
                color={ACCENT}
              />
              <Stack spacing={1.5}>
                {(data.lecturers || []).map((l) => {
                  const pct = Number(l.quota) > 0 ? (Number(l.currentSlot) / Number(l.quota)) * 100 : 0;
                  const barColor = pct >= 90 ? "#dc2626" : pct >= 70 ? "#d97706" : "#059669";
                  return (
                    <Box key={l.email}>
                      <Stack direction="row" justifyContent="space-between" mb={0.25}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                          {l.name || l.email}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: barColor, fontSize: "0.75rem", flexShrink: 0 }}>
                          {Number(l.currentSlot || 0)}/{Number(l.quota || 0)} slot
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{
                        "& .MuiLinearProgress-bar": { bgcolor: barColor }
                      }} />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
            <Stack spacing={1.5} sx={{ minWidth: 240 }}>
              <Button variant="contained" color="success" onClick={openSlots} fullWidth sx={{ borderRadius: 2, fontWeight: 700 }}>
                Duyệt mo slot
              </Button>
              {pendingRegs.length > 0 && (
                <Button variant="contained" onClick={bulkApprove} fullWidth sx={{ borderRadius: 2, fontWeight: 700, background: GRADIENT }}>
                  Duyệt {pendingRegs.length} chờ duyệt
                </Button>
              )}
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" onClick={exportExcel} fullWidth sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.8125rem" }}>
                  Excel
                </Button>
                <Button variant="outlined" size="small" onClick={exportPdf} fullWidth sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.8125rem" }}>
                  PDF
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* === SECTION 2: Registration Management === */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
            title="Duyệt đề tài"
            subtitle="Quản lý và duyệt các đề tài đăng ký học kỳ 2026-1"
            gradient={GRADIENT}
            color={ACCENT}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Tìm theo email SV hoặc đề tài..."
              value={regFilter.keyword}
              onChange={(e) => setRegFilter((p) => ({ ...p, keyword: e.target.value }))}
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </InputAdornment>,
                sx: { borderRadius: 2, pl: 0.5 }
              }}
              sx={{ flex: 2 }}
            />
            <TextField
              select size="small" label="Trạng thái" value={regFilter.status}
              onChange={(e) => setRegFilter((p) => ({ ...p, status: e.target.value }))}
              sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha(ACCENT, 0.3), color: ACCENT, fontWeight: 700, "&:hover": { borderColor: ACCENT, bgcolor: alpha(ACCENT, 0.04) } }}>
              Tải lại
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            {["type", "lecturer", "status", "dot"].map((field) => (
              <Box key={field} sx={{ display: "flex", alignItems: "center", mr: 1, mb: 0.5 }}>
                <Box sx={{
                  px: 1.5, py: 0.5, borderRadius: 1.5,
                  bgcolor: colModel[field] !== false ? alpha(ACCENT, 0.1) : "#f1f5f9",
                  border: `1px solid ${colModel[field] !== false ? alpha(ACCENT, 0.25) : "#e2e8f0"}`,
                  cursor: "pointer",
                  onClick: () => setColModel((p) => ({ ...p, [field]: p[field] === false ? true : false })),
                  "&:hover": { bgcolor: colModel[field] !== false ? alpha(ACCENT, 0.15) : "#e2e8f0" }
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem", color: colModel[field] !== false ? ACCENT : "#94a3b8", textTransform: "capitalize" }}>
                    Cột {field}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={regRows}
              columns={regColumns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
              columnVisibilityModel={colModel}
              onColumnVisibilityModelChange={setColModel}
              sx={{
                "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" },
                "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* === SECTION 3: Council Assignment === */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            title="Phân công hội đồng"
            subtitle="Gán GVHD, GVPB, chủ tịch và thông tin bảo vệ"
            gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
            color="#7c3aed"
          />

          {filteredRegs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>Không có đề tài nào để phân công.</Alert>
          ) : (
            <Stack spacing={2}>
              {filteredRegs.map((r) => (
                <Box key={`c-${r.id}`} sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar sx={{ width: 36, height: 36, fontSize: "0.875rem", fontWeight: 800, background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                      {(r.student || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.student}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.topic}
                      </Typography>
                    </Box>
                    <StatusChip status={r.status} />
                  </Stack>
                  <Grid container spacing={1.5} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField size="small" fullWidth select label="GVHD" value={assignments[r.student]?.gvhd || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), gvhd: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                        <MenuItem value="">-- Chọn --</MenuItem>
                        {lecturerEmails.map((e) => <MenuItem key={`h-${e}`} value={e}>{e}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField size="small" fullWidth select label="GVPB" value={assignments[r.student]?.gvpb || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), gvpb: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                        <MenuItem value="">-- Chọn --</MenuItem>
                        {lecturerEmails.map((e) => <MenuItem key={`r-${e}`} value={e}>{e}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField size="small" fullWidth select label="Chủ tịch" value={assignments[r.student]?.chairman || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), chairman: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                        <MenuItem value="">-- Chọn --</MenuItem>
                        {lecturerEmails.map((e) => <MenuItem key={`c-${e}`} value={e}>{e}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField size="small" fullWidth id={`hod-date-${r.student}`} label="Ngày bảo vệ" type="date" value={assignments[r.student]?.date || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), date: e.target.value } }))} InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField size="small" fullWidth label="Địa điểm" value={assignments[r.student]?.location || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), location: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={0.8}>
                      <Button size="small" variant="contained" onClick={() => assignCouncil(r.student)} fullWidth sx={{ borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #a78bfa)", "&:hover": { boxShadow: `0 4px 12px ${alpha("#7c3aed", 0.35)}` } }}>
                        Luu
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* === SECTION 4: Audit Log === */}
      {auditRows.length > 0 && (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                title="Nhật ký hành động"
                subtitle="Nhật ký hoạt động hệ thống"
                gradient="linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)"
                color="#0f766e"
              />
              <Button size="small" variant="outlined" onClick={exportAuditCsv} sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0 }}>
                Export CSV
              </Button>
            </Stack>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={auditRows}
                columns={[
                  { field: "ts", headerName: "Thời gian", minWidth: 180, flex: 1 },
                  { field: "role", headerName: "Vai trò", width: 110 },
                  { field: "actor", headerName: "Tác giả", minWidth: 180, flex: 1 },
                  { field: "action", headerName: "Hành động", minWidth: 200, flex: 1 },
                  { field: "target", headerName: "Đối tượng", minWidth: 180, flex: 1 },
                  { field: "detail", headerName: "Chi tiết", minWidth: 220, flex: 1.2 }
                ]}
                pageSizeOptions={[5, 10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" },
                  "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" },
                  "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" },
                  "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* === SECTION 5: Account Management === */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
            title="Quản lý tài khoản sinh viên"
            subtitle="Duyệt hoặc từ chối tài khoản sinh viên mới đăng ký"
            gradient="linear-gradient(135deg, #dc2626 0%, #f87171 100%)"
            color="#dc2626"
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Tìm theo email, tên hoặc MSSV..."
              value={userFilter.keyword}
              onChange={(e) => setUserFilter((p) => ({ ...p, keyword: e.target.value }))}
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </InputAdornment>,
                sx: { borderRadius: 2, pl: 0.5 }
              }}
              sx={{ flex: 2 }}
            />
            <TextField
              select size="small" label="Trạng thái" value={userFilter.status}
              onChange={(e) => setUserFilter((p) => ({ ...p, status: e.target.value }))}
              sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha("#dc2626", 0.3), color: "#dc2626", fontWeight: 700 }}>
              Tải lại
            </Button>
          </Stack>

          {pendingUserCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
              Có {pendingUserCount} tài khoản đang chờ duyệt.
            </Alert>
          )}

          <Box sx={{ height: 420 }}>
            <DataGrid
              rows={userRows}
              columns={[
                { field: "name", headerName: "Họ tên", minWidth: 180, flex: 1, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography> },
                { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
                { field: "mssv", headerName: "MSSV", width: 120 },
                { field: "major", headerName: "Chuyên ngành", width: 130 },
                { field: "status", headerName: "Trạng thái", width: 130, renderCell: (p) => <StatusChip status={p.value} /> },
                { field: "createdAt", headerName: "Ngày ĐK", minWidth: 140, flex: 1 },
                {
                  field: "action", headerName: "Hành động", minWidth: 220, sortable: false, filterable: false,
                  renderCell: (params) => {
                    const st = params.row.status;
                    if (st === "PENDING") {
                      return (
                        <Stack direction="row" spacing={0.75}>
                          <Button size="small" variant="contained" color="success" onClick={() => approveUser(params.row.email)} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>
                            Duyệt
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => rejectUser(params.row.email)} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>
                            Từ chối
                          </Button>
                        </Stack>
                      );
                    }
                    return (
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem", color: st === "APPROVED" ? "#059669" : "#dc2626" }}>
                        {st === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}
                      </Typography>
                    );
                  }
                }
              ]}
              pageSizeOptions={[5, 10, 20]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" },
                "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default HODPage;
