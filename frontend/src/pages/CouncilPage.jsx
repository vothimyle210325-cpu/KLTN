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
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const GRADIENT = "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)";
const COLOR = "#7c3aed";

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

const StatusChip = ({ status }) => {
  const map = { PENDING: { label: "Chờ duyệt", color: "#d97706" }, APPROVED: { label: "Đã duyệt", color: "#059669" }, REJECTED: { label: "Đã từ chối", color: "#dc2626" } };
  const c = map[status] || { label: "Mới", color: "#0284c7" };
  return <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.1), color: c.color, border: `1px solid ${alpha(c.color, 0.25)}`, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
};

export default function CouncilPage() {
  const [data, setData] = useState({ registrations: [], lecturers: [], councils: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [assignments, setAssignments] = useState({});
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState("form"); // "form" | "table"

  async function load() {
    setLoading(true);
    const res = await callApi("getTBMDashboard");
    if (res.ok) setData(res.data || {});
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const councils = data.councils || [];
    setAssignments((prev) => {
      const next = { ...prev };
      councils.forEach((c) => {
        next[c.student] = {
          gvhd: c.gvhd || "",
          gvpb: c.gvpb || "",
          chairman: c.chairman || "",
          secretary: c.secretary || "",
          date: (c.date && String(c.date).slice(0, 10)) || "",
          location: c.location || "",
          minutesUrl: c.minutesUrl || ""
        };
      });
      return next;
    });
  }, [data.councils]);

  async function assignCouncil(student) {
    const v = assignments[student] || {};
    const res = await callApi("assignCouncil", {
      student, by: "tbm", role: "TBM",
      gvhd: v.gvhd || "", gvpb: v.gvpb || "",
      chairman: v.chairman || "", secretary: v.secretary || "",
      date: v.date || "", location: v.location || "",
      minutesUrl: v.minutesUrl || ""
    });
    if (res.ok) { setMessage("Đã lưu phân công hội đồng!"); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function sendNotification(student) {
    const res = await callApi("sendCouncilNotification", { student, by: "tbm", role: "TBM" });
    if (res.ok) setMessage(`Đã gửi thông báo den ${student}!`);
    else setMessage(res.message || "Lỗi gửi thông báo");
  }

  async function bulkAssign() {
    const approved = (data.registrations || []).filter((r) => r.status === "APPROVED");
    let count = 0;
    for (const r of approved) {
      const v = assignments[r.student];
      if (!v) continue;
      await callApi("assignCouncil", {
        student: r.student, by: "tbm", role: "TBM",
        gvhd: v.gvhd || "", gvpb: v.gvpb || "", chairman: v.chairman || "", secretary: v.secretary || "",
        date: v.date || "", location: v.location || "", minutesUrl: v.minutesUrl || ""
      });
      count++;
    }
    setMessage(`Đã lưu ${count} phan cong hoi dong!`);
    load();
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("L");
    autoTable(doc, {
      head: [["Sinh viên", "GVHD", "GVPB", "Chủ tịch", "Thư ký", "Ngày", "Địa điểm", "Biên bản", "Trạng thái"]],
      body: (data.councils || []).map((c) => [c.student, c.gvhd, c.gvpb, c.chairman, c.secretary, c.date, c.location, c.minutesUrl || "", c.councilStatus || c.status])
    });
    doc.save(`phan-cong-hoi-dong-${Date.now()}.pdf`);
  }

  const lecturerEmails = (data.lecturers || []).map((l) => l.email);

  const filtered = (data.registrations || []).filter((r) => {
    const kw = keyword.trim().toLowerCase();
    const hit = !kw || String(r.student || "").toLowerCase().includes(kw) || String(r.topic || "").toLowerCase().includes(kw);
    const statusOk = filterStatus === "ALL" || r.status === filterStatus;
    return hit && statusOk;
  });

  const councilRows = (data.councils || []).map((c, i) => ({ id: i, ...c }));

  const councilColumns = [
    { field: "student", headerName: "Sinh viên", minWidth: 200, flex: 1, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography> },
    { field: "gvhd", headerName: "GVHD", minWidth: 180, flex: 1 },
    { field: "gvpb", headerName: "GVPB", minWidth: 180, flex: 1 },
    { field: "chairman", headerName: "Chủ tịch", minWidth: 140, flex: 0.8 },
    { field: "secretary", headerName: "Thư ký", minWidth: 140, flex: 0.8 },
    { field: "date", headerName: "Ngày bảo vệ", width: 130 },
    { field: "location", headerName: "Địa điểm", width: 140 },
    {
      field: "minutesUrl",
      headerName: "Biên bản",
      width: 110,
      sortable: false,
      renderCell: (p) =>
        p.value && String(p.value).startsWith("http") ? (
          <Button size="small" variant="outlined" href={p.value} target="_blank" rel="noreferrer" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
            Mở
          </Button>
        ) : (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>—</Typography>
        )
    },
    { field: "councilStatus", headerName: "Trạng thái", width: 130, renderCell: (p) => <StatusChip status={p.value} /> }
  ];

  const assignedCount = (data.councils || []).length;
  const approvedCount = (data.registrations || []).filter((r) => r.status === "APPROVED").length;

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Stats */}
      <Grid container spacing={2}>
        {[
          { label: "Đề tài đã duyệt", value: approvedCount, color: "#059669", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Đã phân công HD", value: assignedCount, color: COLOR, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
          { label: "Chưa phân công", value: approvedCount - assignedCount, color: "#d97706", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
        ].map(({ label, value, color, icon }) => (
          <Grid item xs={6} sm={4} key={label}>
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
          <Stack direction="row" alignItems="flex-start" spacing={2} mb={2.5}>
            <Box sx={{ flex: 1 }}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                title="Phân công hội đồng bảo vệ"
                subtitle="Gán GVHD, GVPB, chủ tịch và thông tin bảo vệ cho mỗi đề tài"
                gradient={GRADIENT}
                color={COLOR}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant={viewMode === "form" ? "contained" : "outlined"} onClick={() => setViewMode("form")} sx={{ borderRadius: 2, fontWeight: 700, background: viewMode === "form" ? GRADIENT : "transparent", borderColor: alpha(COLOR, 0.3), color: viewMode === "form" ? "white" : COLOR }}>
                Form
              </Button>
              <Button size="small" variant={viewMode === "table" ? "contained" : "outlined"} onClick={() => setViewMode("table")} sx={{ borderRadius: 2, fontWeight: 700, background: viewMode === "table" ? GRADIENT : "transparent", borderColor: alpha(COLOR, 0.3), color: viewMode === "table" ? "white" : COLOR }}>
                Bang du lieu
              </Button>
              <Button size="small" variant="outlined" onClick={bulkAssign} sx={{ borderRadius: 2, fontWeight: 700, borderColor: alpha(COLOR, 0.3), color: COLOR }}>Lưu nhiều</Button>
              <Button size="small" variant="outlined" onClick={exportPdf} sx={{ borderRadius: 2, fontWeight: 700, borderColor: alpha(COLOR, 0.3), color: COLOR }}>Export PDF</Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2}>
            <TextField
              fullWidth
              placeholder="Tìm theo email SV hoặc tên đề tài..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></InputAdornment>, sx: { borderRadius: 2, pl: 0.5 } }}
            />
            <TextField select size="small" label="Trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tat ca</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha(COLOR, 0.3), color: COLOR, fontWeight: 700, "&:hover": { borderColor: COLOR, bgcolor: alpha(COLOR, 0.04) } }}>
              Tải lại
            </Button>
          </Stack>

          {viewMode === "form" ? (
            filtered.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>Không có đề tài nào để phân công.</Alert>
            ) : (
              <Stack spacing={2}>
                {filtered.map((r) => (
                  <Box key={`c-${r.id}`} sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <Avatar sx={{ width: 38, height: 38, fontSize: "0.875rem", fontWeight: 800, background: GRADIENT }}>{(r.student || "?").charAt(0).toUpperCase()}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.student}</Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.topic}</Typography>
                      </Box>
                      <StatusChip status={r.status} />
                      {r.status === "APPROVED" && (
                        <Button size="small" variant="text" onClick={() => sendNotification(r.student)} sx={{ fontWeight: 700, color: "#0284c7", fontSize: "0.75rem" }}>
                          Gửi thông báo
                        </Button>
                      )}
                    </Stack>
                    <Grid container spacing={1.5} alignItems="flex-end">
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField size="small" fullWidth select label="GVHD" value={assignments[r.student]?.gvhd || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), gvhd: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                          <MenuItem value="">-- Chọn --</MenuItem>
                          {lecturerEmails.map((e) => <MenuItem key={`h-${e}`} value={e}>{e}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField size="small" fullWidth select label="GVPB" value={assignments[r.student]?.gvpb || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), gvpb: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                          <MenuItem value="">-- Chọn --</MenuItem>
                          {lecturerEmails.map((e) => <MenuItem key={`r-${e}`} value={e}>{e}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField size="small" fullWidth select label="Chủ tịch" value={assignments[r.student]?.chairman || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), chairman: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                          <MenuItem value="">-- Chọn --</MenuItem>
                          {lecturerEmails.map((e) => <MenuItem key={`c-${e}`} value={e}>{e}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField size="small" fullWidth select label="Thư ký" value={assignments[r.student]?.secretary || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), secretary: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                          <MenuItem value="">-- Chọn --</MenuItem>
                          {lecturerEmails.map((e) => <MenuItem key={`s-${e}`} value={e}>{e}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField size="small" fullWidth id={`council-date-${r.student}`} label="Ngày bảo vệ" type="date" value={assignments[r.student]?.date || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), date: e.target.value } }))} InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField size="small" fullWidth label="Địa điểm" value={assignments[r.student]?.location || ""} onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), location: e.target.value } }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Link biên bản họp (tùy chọn — thường do Thư ký cập nhật)"
                          placeholder="https://docs.google.com/..."
                          value={assignments[r.student]?.minutesUrl || ""}
                          onChange={(e) => setAssignments((p) => ({ ...p, [r.student]: { ...(p[r.student] || {}), minutesUrl: e.target.value } }))}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button size="small" variant="contained" onClick={() => assignCouncil(r.student)} fullWidth sx={{ borderRadius: 2, fontWeight: 700, background: GRADIENT, "&:hover": { boxShadow: `0 4px 12px ${alpha(COLOR, 0.35)}` } }}>
                          Lưu
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            )
          ) : (
            <Box sx={{ height: 520 }}>
              <DataGrid
                rows={councilRows}
                columns={councilColumns}
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
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
