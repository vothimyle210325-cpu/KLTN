import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const GRADIENT = "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";
const COLOR = "#1e40af";

export default function PeriodsPage() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [periods, setPeriods] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", bcttDeadline: "", kltnDeadline: "", revisionDeadline: "", status: "ACTIVE" });

  async function load() {
    setLoading(true);
    const res = await callApi("getPeriods");
    if (res.ok) setPeriods(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(period) {
    if (period) {
      setSelected(period);
      setForm({ name: period.name || "", bcttDeadline: period.bcttDeadline || "", kltnDeadline: period.kltnDeadline || "", revisionDeadline: period.revisionDeadline || "", status: period.status || "ACTIVE" });
    } else {
      setSelected(null);
      setForm({ name: "", bcttDeadline: "", kltnDeadline: "", revisionDeadline: "", status: "ACTIVE" });
    }
    setEditOpen(true);
  }

  async function savePeriod() {
    const payload = { ...form, by: user?.email, role: user?.role };
    if (selected) payload.id = selected.id;
    const res = await callApi("savePeriod", payload);
    if (res.ok) { setMessage("Lưu đợt thành công!"); setEditOpen(false); load(); }
    else setMessage(res.message || "Loi");
  }

  const rows = periods.map((p, i) => ({ id: i, ...p }));

  const columns = [
    { field: "name", headerName: "Ten dot", minWidth: 200, flex: 1 },
    { field: "bcttDeadline", headerName: "Hạn nộp BCTT", width: 150 },
    { field: "kltnDeadline", headerName: "Hạn nộp KLTN", width: 150 },
    { field: "revisionDeadline", headerName: "Han chinh sua", width: 150 },
    { field: "status", headerName: "Trang thai", width: 130, renderCell: (p) => (
      <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: alpha(p.value === "ACTIVE" ? "#059669" : "#64748b", 0.1), border: `1px solid ${alpha(p.value === "ACTIVE" ? "#059669" : "#64748b", 0.3)}` }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: p.value === "ACTIVE" ? "#059669" : "#64748b" }}>{p.value === "ACTIVE" ? "Đang hoạt động" : p.value}</Typography>
      </Box>
    )},
    { field: "action", headerName: "Thao tac", width: 140, sortable: false, renderCell: (p) => (
      <Button size="small" variant="outlined" onClick={() => openEdit(p.row)} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>Chinh sua</Button>
    )}
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Loi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ background: GRADIENT, p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>Quan ly dot hoc</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Thiết lập hạn nộp bài cho các đợt BCTT / KLTN</Typography>
            </Box>
          </Stack>
          <Button variant="contained" onClick={() => openEdit(null)} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
            + Tạo đợt mới
          </Button>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ height: 480 }}>
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" }, "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }, "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" } }} />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{selected ? "Chỉnh sửa đợt học" : "Tạo đợt học mới"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth id="period-name" label="Ten dot" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: Hoc ky 2026-1" InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField fullWidth id="period-bctt" label="Hạn nộp BCTT" type="date" value={form.bcttDeadline} onChange={(e) => setForm((p) => ({ ...p, bcttDeadline: e.target.value }))} InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField fullWidth id="period-kltn" label="Hạn nộp KLTN" type="date" value={form.kltnDeadline} onChange={(e) => setForm((p) => ({ ...p, kltnDeadline: e.target.value }))} InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField fullWidth id="period-revision" label="Hạn nộp bài chỉnh sửa" type="date" value={form.revisionDeadline} onChange={(e) => setForm((p) => ({ ...p, revisionDeadline: e.target.value }))} InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField fullWidth id="period-status" select label="Trang thai" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} InputProps={{ sx: { borderRadius: 2 } }}>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 700 }}>Huy</Button>
          <Button variant="contained" onClick={savePeriod} sx={{ fontWeight: 700, background: GRADIENT }}>Luu</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
