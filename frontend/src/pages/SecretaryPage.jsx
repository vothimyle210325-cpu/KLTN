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

const GRADIENT_THUKY = "linear-gradient(135deg, #059669 0%, #14b8a6 100%)";
const COLOR_THUKY = "#059669";

function ScoreBadge({ score }) {
  if (!score && score !== 0) return <Chip label="Chưa chấm" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />;
  const { color } = scoreRatioHue(score);
  const label = Number(score) > 10 ? `${score} / 12` : String(score);
  return <Chip label={label} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: "0.8rem" }} />;
}

export default function SecretaryPage() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [councils, setCouncils] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [finalScoreDraft, setFinalScoreDraft] = useState("");
  const [minutesUrlDraft, setMinutesUrlDraft] = useState("");

  async function load() {
    setLoading(true);
    const res = await callApi("getSecretaryDashboard", { email: user?.email });
    if (res.ok) setCouncils(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openDetail(council) {
    setSelected(council);
    setFinalScoreDraft(council.finalScore ? String(council.finalScore) : "");
    setMinutesUrlDraft(council.minutesUrl || "");
    setDetailOpen(true);
  }

  async function saveMinutesUrl() {
    if (!selected) return;
    const res = await callApi("saveCouncilMinutesUrl", {
      student: selected.student,
      minutesUrl: minutesUrlDraft,
      by: user?.email,
      role: user?.role
    });
    if (res.ok) {
      setMessage("Đã cập nhật link biên bản!");
      load();
    } else setMessage(res.message || "Lỗi");
  }

  async function saveFinalScore() {
    if (!selected) return;
    const res = await callApi("saveFinalScore", { student: selected.student, finalScore: finalScoreDraft, by: user?.email, role: user?.role });
    if (res.ok) { setMessage("Lưu điểm cuối cùng thành công!"); setDetailOpen(false); load(); }
    else setMessage(res.message || "Loi");
  }

  async function updateCouncilStatus(status) {
    if (!selected) return;
    const res = await callApi("updateCouncilStatus", { student: selected.student, status, by: user?.email, role: user?.role });
    if (res.ok) { setMessage("Cập nhật trạng thái thành công!"); load(); }
    else setMessage(res.message || "Loi");
  }

  const rows = councils.map((c, i) => ({ id: i, ...c }));

  const columns = [
    { field: "studentName", headerName: "Sinh viên", minWidth: 200, flex: 1 },
    { field: "date", headerName: "Ngay bao ve", width: 150 },
    { field: "location", headerName: "Địa điểm", width: 140 },
    {
      field: "minutesUrl",
      headerName: "Bien ban HD",
      width: 130,
      sortable: false,
      renderCell: (p) =>
        p.value && String(p.value).startsWith("http") ? (
          <Button size="small" variant="outlined" href={p.value} target="_blank" rel="noreferrer" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
            Mo link
          </Button>
        ) : (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>—</Typography>
        )
    },
    { field: "finalScore", headerName: "Điểm TB", width: 120, renderCell: (p) => <ScoreBadge score={p.value} /> },
    { field: "councilStatus", headerName: "Trang thai", width: 130, renderCell: (p) => (
      <Chip label={p.value === "DEFENDED" ? "Đã bảo vệ" : p.value === "PENDING" ? "Chờ bảo vệ" : p.value} size="small" sx={{ bgcolor: alpha(p.value === "DEFENDED" ? "#059669" : "#d97706", 0.1), color: p.value === "DEFENDED" ? "#059669" : "#d97706", fontWeight: 700, fontSize: "0.7rem" }} />
    )},
    { field: "action", headerName: "Thao tac", width: 140, sortable: false, renderCell: (p) => (
      <Button size="small" variant="outlined" onClick={() => openDetail(p.row)} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>Xem / Sua</Button>
    )}
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Loi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ background: GRADIENT_THUKY, p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>Thu ky Hoi dong</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Xem điểm, tạo biên bản hội đồng, cập nhật trạng thái</Typography>
            </Box>
          </Stack>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 3, bgcolor: alpha(COLOR_THUKY, 0.04), border: `1px solid ${alpha(COLOR_THUKY, 0.2)}` }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: "#065f46", fontWeight: 600 }}>
            Thư ký có thể: xem điểm các thành viên, nhập điểm cuối, dán link biên bản họp hội đồng (Google Docs/Drive), cập nhật trạng thái bảo vệ.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Danh sách sinh viên hội đồng</Typography>
          <Box sx={{ height: 480 }}>
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{
              "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" },
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" },
              "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" }
            }} />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Chi tiet: {selected?.studentName}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2.5}>
              <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Bảng điểm thành viên</Typography>
                <Stack spacing={1.5}>
                  {Object.entries(selected.scores || {}).map(([role, sc]) => (
                    <Box key={role}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b" }}>
                        {role === "CHUTICH" ? "Chủ tịch" : role === "GVHD" ? "GV Hướng dẫn" : role === "GVPB" ? "GV Phản biện" : role}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ScoreBadge score={sc?.score} />
                        <Typography variant="caption" sx={{ color: "#475569", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sc?.comment || "—"}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <TextField
                fullWidth id="secretary-final-score" label="Điểm cuoi cung (trung binh)"
                type="number"
                value={finalScoreDraft}
                onChange={(e) => setFinalScoreDraft(e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 12, step: 0.1 } }}
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Link biên bản họp hội đồng (Google Docs / Drive)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="https://docs.google.com/... hoặc link Drive"
                  value={minutesUrlDraft}
                  onChange={(e) => setMinutesUrlDraft(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Button variant="outlined" onClick={saveMinutesUrl} sx={{ alignSelf: "flex-start", fontWeight: 700, borderRadius: 2 }}>
                  Lưu link biên bản
                </Button>
              </Stack>

              <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Cập nhật trạng thái</Typography>
                <Stack direction="row" spacing={1}>
                  {["PENDING", "DEFENDED"].map((st) => (
                    <Button key={st} size="small" variant={selected.councilStatus === st ? "contained" : "outlined"} onClick={() => updateCouncilStatus(st)} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5 }}>
                      {st === "DEFENDED" ? "Đã bảo vệ" : "Chờ bảo vệ"}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ fontWeight: 700 }}>Huy</Button>
          <Button variant="contained" onClick={saveFinalScore} sx={{ fontWeight: 700, background: GRADIENT_THUKY }}>Lưu điểm cuối cùng</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
