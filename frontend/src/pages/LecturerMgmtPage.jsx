import { useEffect, useState } from "react";
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
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

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

export default function LecturerMgmtPage() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [majorFilter, setMajorFilter] = useState("ALL");
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quotaForm, setQuotaForm] = useState({ quota: "", note: "" });

  async function load() {
    setLoading(true);
    const res = await callApi("getTBMDashboard");
    if (res.ok) setLecturers(res.data?.lecturers || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateQuota() {
    const res = await callApi("updateLecturerQuota", {
      email: selected?.email,
      quota: Number(quotaForm.quota),
      note: quotaForm.note,
      by: "tbm", role: "TBM"
    });
    if (res.ok) { setMessage("Đã cập nhật quota thành công!"); setQuotaOpen(false); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function openSlots() {
    const res = await callApi("openLecturerSlots", { by: "tbm", role: "TBM" });
    if (res.ok) { setMessage("Đã mở slot cho các giảng viên!"); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function exportCsv() {
    const rows = [["Họ tên", "Email", "Chuyên ngành", "Quota", "Đã nhận", "Còn lại", "Tỷ lệ %"]];
    lecturers.forEach((l) => {
      const quota = Number(l.quota || 0);
      const current = Number(l.currentSlot || 0);
      const pct = quota > 0 ? Math.round((current / quota) * 100) : 0;
      rows.push([l.name, l.email, l.majors, quota, current, quota - current, pct + "%"]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `giang-vien-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  }

  const filtered = lecturers.filter((l) => {
    const kw = keyword.trim().toLowerCase();
    const hit = !kw || String(l.name || "").toLowerCase().includes(kw) || String(l.email || "").toLowerCase().includes(kw) || String(l.majors || "").toLowerCase().includes(kw);
    const majorOk = majorFilter === "ALL" || (l.majors || "").toLowerCase().includes(majorFilter.toLowerCase());
    return hit && majorOk;
  });

  const rows = filtered.map((l, i) => ({ id: l.email || i, ...l }));

  const getBarColor = (pct) => {
    if (pct >= 90) return "#dc2626";
    if (pct >= 70) return "#d97706";
    return "#059669";
  };

  const columns = [
    {
      field: "name", headerName: "Giảng viên", minWidth: 200, flex: 1,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, fontSize: "0.75rem", fontWeight: 800, background: GRADIENT }}>{(p.value || "?").charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>{p.row.email}</Typography>
          </Box>
        </Stack>
      )
    },
    { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
    { field: "majors", headerName: "Chuyên ngành", minWidth: 180, flex: 1 },
    {
      field: "quota", headerName: "Quota", width: 100,
      renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>{p.value}</Typography>
    },
    {
      field: "currentSlot", headerName: "Đã nhận", width: 100,
      renderCell: (p) => {
        const quota = Number(p.row.quota || 0);
        const current = Number(p.value || 0);
        const pct = quota > 0 ? (current / quota) * 100 : 0;
        const barColor = getBarColor(pct);
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem", color: barColor }}>{current}</Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>/ {quota}</Typography>
          </Stack>
        );
      }
    },
    {
      field: "slot_pct", headerName: "Tỷ lệ nạp", width: 160,
      sortable: true,
      renderCell: (p) => {
        const quota = Number(p.row.quota || 0);
        const current = Number(p.row.currentSlot || 0);
        const pct = quota > 0 ? (current / quota) * 100 : 0;
        const barColor = getBarColor(pct);
        return (
          <Box sx={{ width: "100%", pr: 1 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.25}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: barColor, fontSize: "0.7rem" }}>
                {Math.round(pct)}%
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                {quota - current} con trong
              </Typography>
            </Stack>
            <Box sx={{ width: "100%", height: 6, borderRadius: 3, bgcolor: "#e2e8f0", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 3, bgcolor: barColor, transition: "width 0.3s" }} />
            </Box>
          </Box>
        );
      }
    },
    {
      field: "action", headerName: "Thao tác", width: 140, sortable: false, filterable: false,
      renderCell: (p) => (
        <Button size="small" variant="outlined" onClick={() => { setSelected(p.row); setQuotaForm({ quota: String(p.row.quota || ""), note: p.row.note || "" }); setQuotaOpen(true); }} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5, borderColor: alpha(COLOR, 0.4), color: COLOR }}>
          Chinh sua
        </Button>
      )
    }
  ];

  const totalQuota = lecturers.reduce((sum, l) => sum + Number(l.quota || 0), 0);
  const totalCurrent = lecturers.reduce((sum, l) => sum + Number(l.currentSlot || 0), 0);
  const fullCount = lecturers.filter((l) => Number(l.quota) > 0 && Number(l.currentSlot || 0) >= Number(l.quota)).length;

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Stats */}
      <Grid container spacing={2}>
        {[
          { label: "Tổng giảng viên", value: lecturers.length, color: COLOR, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
          { label: "Tổng quota", value: totalQuota, color: "#1e40af", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
          { label: "Đã nhận", value: totalCurrent, color: "#059669", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Đã đầy", value: fullCount, color: "#dc2626", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
        ].map(({ label, value, color, icon }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha(color, 0.25)}`, "& svg": { color: "white" } }}>{icon}</Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
            <Box sx={{ flex: 1 }}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                title="Quản lý giảng viên"
                subtitle="Cập nhật quota và theo dõi số lượng sinh viên hướng dẫn"
                gradient={GRADIENT}
                color={COLOR}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" color="success" onClick={openSlots} sx={{ borderRadius: 2, fontWeight: 700 }}>
                Mở slot đăng ký
              </Button>
              <Button size="small" variant="outlined" onClick={exportCsv} sx={{ borderRadius: 2, fontWeight: 700, borderColor: alpha(COLOR, 0.3), color: COLOR }}>
                Export CSV
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Tìm theo tên, email hoặc chuyên ngành..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></InputAdornment>, sx: { borderRadius: 2, pl: 0.5 } }}
              sx={{ flex: 2 }}
            />
            <TextField select size="small" label="Chuyên ngành" value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)} sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tat ca nganh</MenuItem>
              {["Công Nghệ Thông Tin", "Kỹ Thuật Máy Tính", "Mạng Máy Tính", "Khoa Học Máy Tính", "An Toàn Thông Tin", "Trí Tuệ Nhân Tạo"].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha(COLOR, 0.3), color: COLOR, fontWeight: 700, "&:hover": { borderColor: COLOR, bgcolor: alpha(COLOR, 0.04) } }}>
              Tải lại
            </Button>
          </Stack>

          <Box sx={{ height: 520 }}>
            <DataGrid
              rows={rows}
              columns={columns}
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

      {/* Quota Dialog */}
      <Dialog open={quotaOpen} onClose={() => setQuotaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Chinh sua quota GV</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2} mt={1}>
              <Stack direction="row" spacing={2}>
                <Avatar sx={{ background: GRADIENT }}>{(selected.name || "?").charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selected.name}</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>{selected.email}</Typography>
                </Box>
              </Stack>
              <TextField
                fullWidth
                label="Số quota (số sinh viên tối đa)"
                type="number"
                value={quotaForm.quota}
                onChange={(e) => setQuotaForm((p) => ({ ...p, quota: e.target.value }))}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                helperText={`Hiện đang hướng dẫn: ${selected.currentSlot || 0} sinh viên`}
              />
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={2}
                value={quotaForm.note}
                onChange={(e) => setQuotaForm((p) => ({ ...p, note: e.target.value }))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setQuotaOpen(false)} sx={{ fontWeight: 700 }}>Huy</Button>
          <Button variant="contained" onClick={updateQuota} sx={{ fontWeight: 700, background: GRADIENT }}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
