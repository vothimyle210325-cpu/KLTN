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
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";
import { scoreRatioHue } from "../utils/scoreHue";

const GRADIENT = "linear-gradient(135deg, #059669 0%, #34d399 100%)";
const COLOR = "#059669";

function ScoreBadge({ score }) {
  if (!score && score !== 0) return <Chip label="Chưa chấm" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />;
  const { color } = scoreRatioHue(score);
  const max = Number(score) > 10 ? 12 : 10;
  const label = Number(score) > 10 ? `${score} / ${max}` : String(score);
  return <Chip label={label} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: "0.8rem" }} />;
}

export default function ChairmanPage() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [councils, setCouncils] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [scores, setScores] = useState({});

  async function load() {
    setLoading(true);
    const res = await callApi("getChairmanDashboard", { email: user?.email });
    if (res.ok) setCouncils(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openDetail(council) {
    setSelected(council);
    setDetailOpen(true);
    const sc = await callApi("getAllScores", { student: council.student, type: "KLTN" });
    if (sc.ok) setScores(sc.data?.scores || {});
  }

  const rows = councils.map((c, i) => ({ id: i, ...c }));

  const columns = [
    { field: "studentName", headerName: "Sinh viên", minWidth: 200, flex: 1, renderCell: (p) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", color: "white" }}>
          {(p.value || "?").charAt(0).toUpperCase()}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.value}</Typography>
      </Stack>
    )},
    { field: "date", headerName: "Ngay bao ve", width: 150 },
    { field: "location", headerName: "Địa điểm", width: 140 },
    { field: "gvhdScore", headerName: "Điểm GVHD", width: 120, renderCell: (p) => <ScoreBadge score={p.value} /> },
    { field: "gvpbScore", headerName: "Điểm GVPB", width: 120, renderCell: (p) => <ScoreBadge score={p.value} /> },
    { field: "chairmanScore", headerName: "Điểm CT", width: 120, renderCell: (p) => <ScoreBadge score={p.value} /> },
    { field: "finalScore", headerName: "Điểm TB", width: 120, renderCell: (p) => <ScoreBadge score={p.value} /> },
    {
      field: "minutesUrl",
      headerName: "Bien ban HD",
      width: 130,
      sortable: false,
      renderCell: (p) =>
        p.value && String(p.value).startsWith("http") ? (
          <Button size="small" variant="outlined" href={p.value} target="_blank" rel="noreferrer" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
            Mở link
          </Button>
        ) : (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>—</Typography>
        )
    },
    { field: "councilStatus", headerName: "Trang thai", width: 130, renderCell: (p) => (
      <Chip label={p.value === "DEFENDED" ? "Đã bảo vệ" : "Chưa bảo vệ"} size="small" sx={{ bgcolor: alpha(p.value === "DEFENDED" ? "#059669" : "#d97706", 0.1), color: p.value === "DEFENDED" ? "#059669" : "#d97706", fontWeight: 700, fontSize: "0.7rem" }} />
    )},
    { field: "action", headerName: "Chi tiet", width: 120, sortable: false, renderCell: (p) => (
      <Button size="small" variant="outlined" onClick={() => openDetail(p.row)} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>Xem</Button>
    )}
  ];

  const defended = councils.filter((c) => c.councilStatus === "DEFENDED").length;

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Loi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Header */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ background: GRADIENT, p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>Chu tich Hoi dong</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Quản lý chấm điểm và duyệt bài chỉnh sửa</Typography>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Stats */}
      <Grid container spacing={2}>
        {[
          { label: "Tong SV hoi dong", value: councils.length, color: COLOR },
          { label: "Đã bảo vệ", value: defended, color: "#059669" },
          { label: "Chưa bảo vệ", value: councils.length - defended, color: "#d97706" }
        ].map(({ label, value, color }) => (
          <Grid item xs={4} key={label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Danh sách sinh viên trong hội đồng</Typography>
          <Box sx={{ height: 480 }}>
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" }, "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }, "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" } }} />
          </Box>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Chi tiết chấm điểm: {selected?.studentName}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: "#475569" }}><strong>Đề tài:</strong> {selected.topic}</Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}><strong>Ngay bao ve:</strong> {selected.date || "—"}</Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}><strong>Địa điểm:</strong> {selected.location || "—"}</Typography>
              {selected.minutesUrl && String(selected.minutesUrl).startsWith("http") ? (
                <Button variant="outlined" href={selected.minutesUrl} target="_blank" rel="noreferrer" sx={{ fontWeight: 700, borderRadius: 2, alignSelf: "flex-start" }}>
                  Mở biên bản hội đồng
                </Button>
              ) : (
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>Chưa có link biên bản (Thư ký sẽ cập nhật).</Typography>
              )}
              <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Bảng điểm chi tiết</Typography>
                <Stack spacing={1}>
                  {["GVHD", "GVPB", "CHUTICH"].map((role) => {
                    const sc = scores[role];
                    return (
                      <Stack key={role} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{role === "CHUTICH" ? "Chủ tịch" : role === "GVHD" ? "GV Hướng dẫn" : "GV Phản biện"}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {sc?.comment && <Typography variant="caption" sx={{ color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sc.comment}</Typography>}
                          <ScoreBadge score={sc?.score} />
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, border: "1.5px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Điểm cuoi: <strong style={{ color: "#059669", fontSize: "1.2rem" }}>{selected.finalScore || "—"}</strong></Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ fontWeight: 700 }}>Dong</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
