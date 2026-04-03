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

const GRADIENT = "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)";
const COLOR = "#7c3aed";

function StatusChip({ status }) {
  const map = { YES: { label: "Đã đồng ý", color: "#059669" }, NO: { label: "Không đồng ý", color: "#dc2626" }, PENDING: { label: "Chờ duyệt", color: "#d97706" } };
  const c = map[status] || { label: status || "PENDING", color: "#64748b" };
  return <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.1), color: c.color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
}

export default function RevisionApprovalPage() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [revisions, setRevisions] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    const res = await callApi("getRevisionApprovals", { email: user?.email, role: user?.role });
    if (res.ok) setRevisions(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleApproval(studentEmail, approval) {
    const action = user?.role === "CHUTICH" ? "approveRevisionChairman" : "approveRevisionGVHD";
    const res = await callApi(action, { student: studentEmail, approval, by: user?.email, role: user?.role });
    if (res.ok) { setMessage(res.message); load(); setDetailOpen(false); }
    else setMessage(res.message || "Loi");
  }

  const rows = revisions.map((r, i) => ({ id: i, ...r }));

  const columns = [
    { field: "studentName", headerName: "Sinh viên", minWidth: 200, flex: 1 },
    { field: "kltnFile", headerName: "File chinh sua", minWidth: 150, renderCell: (p) =>
      p.value ? <Button size="small" variant="outlined" href={p.value} target="_blank" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>Mở file</Button> : <Chip label="Chưa có tệp" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />
    },
    {
      field: "revisionNote",
      headerName: "Bien ban giai trinh (link)",
      minWidth: 220,
      flex: 1,
      renderCell: (p) =>
        p.value && String(p.value).trim().startsWith("http") ? (
          <Button size="small" variant="outlined" href={p.value} target="_blank" rel="noreferrer" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
            Mở biên bản
          </Button>
        ) : (
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.value || "—"}</Typography>
        )
    },
    { field: "gvhdApproval", headerName: "GVHD", width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: "chairmanApproval", headerName: "Chu tich", width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: "action", headerName: "Thao tac", minWidth: 200, sortable: false, renderCell: (p) => {
      const r = p.row;
      const canApprove = user?.role === "GV" && r.canApproveGVHD && r.gvhdApproval === "PENDING";
      const canApproveChair = user?.role === "CHUTICH" && r.canApproveChairman && r.gvhdApproval === "YES" && r.chairmanApproval === "PENDING";
      if (canApprove || canApproveChair) {
        return (
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant="contained" color="success" onClick={() => handleApproval(r.student, "YES")} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }}>Dong y</Button>
            <Button size="small" variant="outlined" color="error" onClick={() => handleApproval(r.student, "NO")} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }}>Từ chối</Button>
          </Stack>
        );
      }
      if (r.gvhdApproval === "PENDING") return <Typography variant="caption" sx={{ color: "#d97706", fontWeight: 600 }}>Chờ GVHD duyệt trước</Typography>;
      if (r.chairmanApproval === "PENDING") return <Typography variant="caption" sx={{ color: "#d97706", fontWeight: 600 }}>Chờ CT duyệt</Typography>;
      return <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600 }}>Đã xử lý</Typography>;
    }}
  ];

  const pendingCount = revisions.filter((r) => {
    if (user?.role === "GV") return r.canApproveGVHD && r.gvhdApproval === "PENDING";
    if (user?.role === "CHUTICH") return r.canApproveChairman && r.gvhdApproval === "YES" && r.chairmanApproval === "PENDING";
    return false;
  }).length;

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
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>
                {user?.role === "CHUTICH" ? "Duyệt chỉnh sửa (Chủ tịch HĐ)" : "Duyệt chỉnh sửa (GVHD)"}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                {user?.role === "CHUTICH" ? "Duyệt bài chỉnh sửa sau khi GVHD đồng ý" : "Xem và duyệt bài chỉnh sửa của SV"}
              </Typography>
            </Box>
            {pendingCount > 0 && (
              <Box sx={{ ml: "auto" }}>
                <Chip label={`${pendingCount} chờ duyệt`} sx={{ bgcolor: "rgba(255,255,255,0.25)", color: "white", fontWeight: 700 }} />
              </Box>
            )}
          </Stack>
        </Box>
      </Card>

      {/* Instructions */}
      <Card sx={{ borderRadius: 3, bgcolor: alpha("#d97706", 0.04), border: "1px solid rgba(217,119,6,0.2)" }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: "#92400e", fontWeight: 600 }}>
            Quy trình: SV nộp bài chỉnh sửa → GVHD duyệt (Đồng ý / Không đồng ý) → Chủ tịch Hội đồng duyệt (sau khi GVHD đồng ý)
          </Typography>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" }, "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }, "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" } }} />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
