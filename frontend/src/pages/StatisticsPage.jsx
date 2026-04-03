import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
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
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const GRADIENT = "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";
const COLOR = "#1e40af";

function StatusChip({ status }) {
  const map = { YES: { label: "Đã đồng ý", color: "#059669" }, NO: { label: "Không đồng ý", color: "#dc2626" }, PENDING: { label: "Chờ duyệt", color: "#d97706" } };
  const c = map[status] || { label: status, color: "#64748b" };
  return <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.1), color: c.color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
}

export default function StatisticsPage() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [selectedDot, setSelectedDot] = useState("ALL");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [periodForm, setPeriodForm] = useState({});

  async function load() {
    setLoading(true);
    const res = await callApi("getStatistics");
    if (res.ok) setStats(res.data);
    const pres = await callApi("getPeriods");
    if (pres.ok) setPeriods(pres.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const dots = stats?.byDot ? Object.keys(stats.byDot) : [];
  const currentDotStats = selectedDot !== "ALL" && stats?.byDot ? stats.byDot[selectedDot] : null;

  const scoreRows = (stats?.kltnScores || []).map((s, i) => ({ id: i, ...s }));

  const scoreColumns = [
    { field: "student", headerName: "Sinh viên", minWidth: 200, flex: 1 },
    { field: "type", headerName: "Loai", width: 100 },
    { field: "role", headerName: "Vai tro cham", width: 130 },
    { field: "score", headerName: "Diem", width: 100, renderCell: (p) => (
      <Typography variant="body2" sx={{ fontWeight: 800, color: Number(p.value) >= 8 ? "#059669" : Number(p.value) >= 5 ? "#d97706" : "#dc2626" }}>
        {p.value}
      </Typography>
    )}
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Loi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Stats overview */}
      <Grid container spacing={2}>
        {[
          { label: "Tổng đề tài", value: stats ? Object.values(stats.byDot || {}).reduce((a, d) => a + d.total, 0) : 0, color: COLOR, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { label: "Đã duyệt", value: stats ? Object.values(stats.byDot || {}).reduce((a, d) => a + d.approved, 0) : 0, color: "#059669", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Chờ duyệt", value: stats ? Object.values(stats.byDot || {}).reduce((a, d) => a + d.pending, 0) : 0, color: "#d97706", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: "Điểm TB KLTN", value: stats?.avgScore || "—", color: "#7c3aed", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }
        ].map(({ label, value, color, icon }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
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

      {/* By dot breakdown */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>Phan bo theo dot</Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>Thống kê số lượng đăng ký theo đợt học</Typography>
            </Box>
            <TextField select size="small" label="Dot" value={selectedDot} onChange={(e) => setSelectedDot(e.target.value)} sx={{ minWidth: 140 }} InputProps={{ sx: { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tat ca dot</MenuItem>
              {dots.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Stack>
          {currentDotStats ? (
            <Grid container spacing={2}>
              {[
                { label: "Tong BCTT", value: currentDotStats.BCTT, color: "#0284c7" },
                { label: "Tong KLTN", value: currentDotStats.KLTN, color: "#7c3aed" },
                { label: "Đã duyệt", value: currentDotStats.approved, color: "#059669" },
                { label: "Chờ duyệt", value: currentDotStats.pending, color: "#d97706" }
              ].map(({ label, value, color }) => (
                <Grid item xs={6} sm={3} key={label}>
                  <Box sx={{ p: 2, borderRadius: 2, border: `1.5px solid ${alpha(color, 0.2)}`, bgcolor: alpha(color, 0.04) }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={1}>
              {dots.map((dot) => {
                const d = stats?.byDot?.[dot];
                return (
                  <Box key={dot} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>{dot}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={`BCTT: ${d?.BCTT || 0}`} size="small" sx={{ bgcolor: alpha("#0284c7", 0.1), color: "#0284c7", fontWeight: 700, fontSize: "0.7rem" }} />
                        <Chip label={`KLTN: ${d?.KLTN || 0}`} size="small" sx={{ bgcolor: alpha("#7c3aed", 0.1), color: "#7c3aed", fontWeight: 700, fontSize: "0.7rem" }} />
                        <Chip label={`Đã duyệt: ${d?.approved || 0}`} size="small" sx={{ bgcolor: alpha("#059669", 0.1), color: "#059669", fontWeight: 700, fontSize: "0.7rem" }} />
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Revision stats */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Thống kê bài chỉnh sửa sau bảo vệ</Typography>
          <Grid container spacing={2}>
            {[
              { label: "Tong bai chinh sua", value: stats?.revisionStats?.total || 0, color: "#475569" },
              { label: "Chờ GVHD duyệt", value: stats?.revisionStats?.pending || 0, color: "#d97706" },
              { label: "GVHD dong y", value: stats?.revisionStats?.gvhdApproved || 0, color: "#059669" },
              { label: "Chu tich dong y", value: stats?.revisionStats?.chairmanApproved || 0, color: "#7c3aed" }
            ].map(({ label, value, color }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Box sx={{ p: 2, borderRadius: 2, border: `1.5px solid ${alpha(color, 0.2)}`, bgcolor: alpha(color, 0.04) }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Scores table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Điểm KLTN chi tiet</Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid rows={scoreRows} columns={scoreColumns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" }, "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9" } }} />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
