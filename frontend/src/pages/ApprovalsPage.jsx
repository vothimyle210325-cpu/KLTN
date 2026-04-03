import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

const StatusChip = ({ status }) => {
  const map = { PENDING: { label: "Chờ duyệt", color: "#d97706" }, APPROVED: { label: "Đã duyệt", color: "#059669" }, REJECTED: { label: "Đã từ chối", color: "#dc2626" }, NEW: { label: "Mới", color: "#0284c7" } };
  const c = map[status] || map.NEW;
  return <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.1), color: c.color, border: `1px solid ${alpha(c.color, 0.25)}`, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
};

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

export default function ApprovalsPage() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState({ keyword: "", status: "ALL", type: "ALL" });
  const [colModel, setColModel] = useState({ type: true, lecturer: true, dot: true, field: true });

  async function load() {
    setLoading(true);
    const res = await callApi("getTBMDashboard");
    if (res.ok) setRegs(res.data?.registrations || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateReg(id, status) {
    const res = await callApi("updateRegistrationStatus", { id, status, by: "tbm", role: "TBM" });
    if (res.ok) { setMessage(status === "APPROVED" ? "Đã duyệt đề tài!" : "Đã từ chối đề tài."); load(); }
    else setMessage(res.message || "Lỗi cập nhật");
  }

  async function bulkAction(status) {
    const ids = filtered.filter((r) => r.status === "PENDING").map((r) => r.id);
    if (!ids.length) return;
    const res = await callApi("approveRegistrationsBulk", { ids, status, by: "tbm", role: "TBM" });
    if (res.ok) { setMessage(`Đã xử lý ${ids.length} hồ sơ!`); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filtered.map((r) => ({ "Sinh viên": r.student, "Loại": r.type, "Đề tài": r.topic, "GVHD": r.lecturer, "Trạng thái": r.status, "Đợt": r.dot })));
    XLSX.utils.book_append_sheet(wb, ws, "Duyệt đề tài");
    XLSX.writeFile(wb, `duyet-de-tai-${Date.now()}.xlsx`);
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Sinh viên", "Loại", "Đề tài", "GVHD", "Trạng thái", "Đợt"]],
      body: filtered.map((r) => [r.student, r.type, r.topic, r.lecturer, r.status, r.dot])
    });
    doc.save(`duyet-de-tai-${Date.now()}.pdf`);
  }

  const pending = regs.filter((r) => r.status === "PENDING");
  const approved = regs.filter((r) => r.status === "APPROVED");
  const rejected = regs.filter((r) => r.status === "REJECTED");

  const filtered = regs.filter((r) => {
    const kw = filter.keyword.trim().toLowerCase();
    const hitKw = !kw || String(r.student || "").toLowerCase().includes(kw) || String(r.topic || "").toLowerCase().includes(kw);
    const hitStatus = filter.status === "ALL" || r.status === filter.status;
    const hitType = filter.type === "ALL" || r.type === filter.type;
    return hitKw && hitStatus && hitType;
  });

  const rows = filtered.map((r, i) => ({ id: r.id || `${r.student}-${i}`, ...r }));

  const columns = [
    { field: "student", headerName: "Sinh viên", minWidth: 220, flex: 1, renderCell: (p) => <Stack direction="row" spacing={1.5} alignItems="center"><Avatar sx={{ width: 34, height: 34, fontSize: "0.75rem", fontWeight: 800, background: GRADIENT }}>{(p.value || "?").charAt(0).toUpperCase()}</Avatar><Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography></Stack> },
    { field: "topic", headerName: "Đề tài", minWidth: 260, flex: 1.4, renderCell: (p) => <Tooltip title={p.value || ""}><Typography variant="body2" sx={{ fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.value || "—"}</Typography></Tooltip> },
    { field: "type", headerName: "Loại", width: 100, renderCell: (p) => <Chip label={p.value} size="small" sx={{ bgcolor: alpha(p.value === "KLTN" ? "#7c3aed" : "#0284c7", 0.1), color: p.value === "KLTN" ? "#7c3aed" : "#0284c7", fontWeight: 700, fontSize: "0.7rem", height: 22 }} /> },
    { field: "lecturer", headerName: "GVHD", minWidth: 200, flex: 1 },
    { field: "field", headerName: "Lĩnh vực", width: 150 },
    { field: "dot", headerName: "Đợt", width: 110 },
    { field: "status", headerName: "Trạng thái", width: 130, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: "action", headerName: "Hành động", minWidth: 200, sortable: false, filterable: false, renderCell: (p) => p.row.status === "PENDING" ? <Stack direction="row" spacing={0.75}><Button size="small" variant="contained" color="success" onClick={() => updateReg(p.row.id, "APPROVED")} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>Duyệt</Button><Button size="small" variant="outlined" color="error" onClick={() => updateReg(p.row.id, "REJECTED")} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>Từ chối</Button></Stack> : <Typography variant="caption" sx={{ fontWeight: 600, color: p.row.status === "APPROVED" ? "#059669" : "#dc2626" }}>{p.row.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}</Typography> }
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      <Grid container spacing={2}>
        {[
          { label: "Tổng hồ sơ", value: regs.length, color: ACCENT, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { label: "Chờ duyệt", value: pending.length, color: "#d97706", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: "Đã duyệt", value: approved.length, color: "#059669", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Đã từ chối", value: rejected.length, color: "#dc2626", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
        ].map(({ label, value, color, icon }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha(color, 0.25)}`, "& svg": { color: "white" } }}>{icon}</Box>
                <Box><Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography></Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} title="Duyệt đề tài đăng ký" subtitle={`${pending.length} hồ sơ đang chờ duyệt — Học kỳ 2026-1`} gradient={GRADIENT} color={ACCENT} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems="center">
            <TextField fullWidth placeholder="Tìm theo email sinh viên hoặc đề tài..." value={filter.keyword} onChange={(e) => setFilter((p) => ({ ...p, keyword: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></InputAdornment>, sx: { borderRadius: 2, pl: 0.5 } }} sx={{ flex: 2 }} />
            <TextField select size="small" label="Trạng thái" value={filter.status} onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            </TextField>
            <TextField select size="small" label="Loại" value={filter.type} onChange={(e) => setFilter((p) => ({ ...p, type: e.target.value }))} sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="BCTT">BCTT</MenuItem>
              <MenuItem value="KLTN">KLTN</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha(ACCENT, 0.3), color: ACCENT, fontWeight: 700 }}>Tải lại</Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b", mr: 1 }}>Cột hiện:</Typography>
            {["type", "lecturer", "status", "dot", "field"].map((f) => (
              <Box key={f} onClick={() => setColModel((p) => ({ ...p, [f]: p[f] === false ? true : false }))} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: colModel[f] !== false ? alpha(ACCENT, 0.1) : "#f1f5f9", border: `1px solid ${colModel[f] !== false ? alpha(ACCENT, 0.25) : "#e2e8f0"}`, cursor: "pointer", mr: 0.75, mb: 0.5, "&:hover": { bgcolor: colModel[f] !== false ? alpha(ACCENT, 0.15) : "#e2e8f0" } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem", color: colModel[f] !== false ? ACCENT : "#94a3b8", textTransform: "capitalize" }}>{f}</Typography>
              </Box>
            ))}
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={0.75}>
              <Button size="small" variant="outlined" onClick={exportExcel} sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.8125rem" }}>Export Excel</Button>
              <Button size="small" variant="outlined" onClick={exportPdf} sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.8125rem" }}>Export PDF</Button>
              {pending.length > 0 && <>
                <Button size="small" variant="contained" color="success" onClick={() => bulkAction("APPROVED")} sx={{ borderRadius: 2, fontWeight: 700 }}>Duyệt tất cả ({pending.length})</Button>
                <Button size="small" variant="outlined" color="error" onClick={() => bulkAction("REJECTED")} sx={{ borderRadius: 2, fontWeight: 700 }}>Từ chối tất cả</Button>
              </>}
            </Stack>
          </Stack>

          <Box sx={{ height: 520 }}>
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick columnVisibilityModel={colModel} onColumnVisibilityModelChange={setColModel} sx={{ "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" }, "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }, "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" } }} />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
