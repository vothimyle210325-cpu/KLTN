import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const GRADIENT_SV = "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)";
const COLOR_SV = "#0284c7";
const GRADIENT_GV = "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)";
const COLOR_GV = "#7c3aed";

const FIELD_OPTIONS = ["CNTT", "HTTT", "AI", "Data", "Security", "Cloud", "Blockchain", "IoT"];

function StatusChip({ status }) {
  const map = { APPROVED: { label: "Đã duyệt", color: "#059669" }, PENDING: { label: "Chờ duyệt", color: "#d97706" }, REJECTED: { label: "Từ chối", color: "#dc2626" } };
  const c = map[status] || { label: status, color: "#64748b" };
  return <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.1), color: c.color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
}

export default function TopicSuggestionPage() {
  const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [mySuggestions, setMySuggestions] = useState([]);
  const [fieldFilter, setFieldFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", field: "", description: "" });
  const [studentStatus, setStudentStatus] = useState(null);

  const isStudent = user?.role === "SV";
  const isLecturer = user?.role === "GV" || user?.role === "THUKY" || user?.role === "CHUTICH";
  const isTBM = user?.role === "TBM" || user?.role === "ADMIN";

  async function load() {
    setLoading(true);
    const res = await callApi("getTopicSuggestions", { email: user?.email, field: fieldFilter });
    if (res.ok) {
      setSuggestions(res.data?.suggestions || []);
      setMySuggestions(res.data?.mySuggestions || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [fieldFilter]);

  useEffect(() => {
    if (!isStudent || !user?.email) return;
    (async () => {
      const res = await callApi("getStudentDashboard", { email: user.email });
      if (res.ok) setStudentStatus(res.data?.student?.status || null);
    })();
  }, [isStudent, user?.email]);

  async function createSuggestion() {
    if (!form.name.trim()) { setMessage("Vui lòng nhập tên đề tài"); return; }
    const res = await callApi("createTopicSuggestion", {
      lecturer: user?.email, name: form.name, field: form.field, description: form.description, role: user?.role
    });
    if (res.ok) { setMessage("Tạo gợi ý thành công!"); setCreateOpen(false); setForm({ name: "", field: "", description: "" }); load(); }
    else setMessage(res.message || "Loi");
  }

  async function approveSuggestion(id, status) {
    const res = await callApi("approveTopicSuggestion", { id, status, by: user?.email, role: user?.role });
    if (res.ok) { setMessage(status === "APPROVED" ? "Đã duyệt gợi ý!" : "Đã từ chối gợi ý."); load(); }
    else setMessage(res.message || "Loi");
  }

  async function chooseSuggestion(s) {
    if (!isStudent) return;
    if (!s?.lecturer) {
      setMessage("Không tìm thấy giảng viên cho gợi ý này.");
      return;
    }
    // Nếu đã duyệt BCTT thì đăng ký KLTN, còn lại đăng ký BCTT.
    const type = studentStatus === "BCTT_APPROVED" ? "KLTN" : "BCTT";
    const res = await callApi("createRegistration", {
      student: user?.email,
      type,
      topic: s?.name,
      lecturer: s?.lecturer,
      field: s?.field || "CNTT",
      dot: "2026-1"
    });
    if (res.ok) {
      setMessage("Chọn đề tài thành công! Vui lòng theo dõi trạng thái ở trang Đăng ký đề tài.");
      // Reset status để UI lấy lại trạng thái mới nhất.
      const dash = await callApi("getStudentDashboard", { email: user?.email });
      if (dash.ok) setStudentStatus(dash.data?.student?.status || null);
      load();
    } else {
      setMessage(res.message || "Lỗi chọn đề tài.");
    }
  }

  const filtered = suggestions.filter((s) => {
    if (!keyword.trim()) return true;
    const kw = keyword.toLowerCase();
    return (s.name || "").toLowerCase().includes(kw) || (s.description || "").toLowerCase().includes(kw) || (s.lecturerName || "").toLowerCase().includes(kw);
  });

  const gradient = isStudent ? GRADIENT_SV : GRADIENT_GV;
  const color = isStudent ? COLOR_SV : COLOR_GV;

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Loi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Header */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ background: gradient, p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>Gợi ý đề tài</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                {isStudent ? "Xem và chọn đề tài từ GVHD" : isLecturer ? "Đăng ký đề tài để SV lựa chọn" : "Quản lý gợi ý đề tài"}
              </Typography>
            </Box>
            {isLecturer && (
              <Box sx={{ ml: "auto" }}>
                <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
                  + Tạo gợi ý mới
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Card>

      {/* Tabs */}
      {isTBM && (
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "stretch" }}>
            {[{ label: "Danh sách gợi ý", key: 0 }, { label: "Đề tài của tôi", key: 1 }].map((t) => (
              <Box key={t.key} onClick={() => setTab(t.key)} sx={{ flex: 1, py: 2, px: 3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, background: tab === t.key ? GRADIENT_GV : "transparent", color: tab === t.key ? "white" : "#64748b", transition: "all 0.2s", borderRight: "1px solid #e2e8f0", "&:last-child": { borderRight: "none" } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>{t.label}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
            <TextField fullWidth placeholder="Tìm kiếm đề tài..." value={keyword} onChange={(e) => setKeyword(e.target.value)} sx={{ flex: 2 }} InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField select size="small" label="Lĩnh vực" value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} sx={{ minWidth: 160 }} InputProps={{ sx: { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tat ca linh vuc</MenuItem>
              {FIELD_OPTIONS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha(color, 0.3), color, fontWeight: 700 }}>Tai lai</Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Suggestions Grid */}
      <Grid container spacing={2}>
        {(tab === 0 ? filtered : mySuggestions).length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#64748b" }}>Chưa có gợi ý đề tài</Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>{isLecturer ? "Hãy tạo gợi ý đề tài đầu tiên của bạn." : "Danh sách gợi ý se duoc hien thi o day."}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          (tab === 0 ? filtered : mySuggestions).map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Card sx={{ borderRadius: 3, height: "100%", border: "1.5px solid #e2e8f0", "&:hover": { borderColor: alpha(color, 0.4), boxShadow: `0 4px 12px ${alpha(color, 0.12)}`, transform: "translateY(-2px)" }, transition: "all 0.2s" }}>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Chip label={s.field} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
                    {isTBM ? <StatusChip status={s.status || "APPROVED"} /> : null}
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, lineHeight: 1.3 }}>
                    {s.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 2, flex: 1, fontSize: "0.8125rem", lineHeight: 1.6 }}>
                    {s.description || "Không có mô tả"}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem", fontWeight: 800, background: gradient }}>{(s.lecturerName || s.lecturer || "?").charAt(0).toUpperCase()}</Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>{s.lecturerName || s.lecturer}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {isTBM && s.status !== "APPROVED" && (
                      <>
                        <Button size="small" variant="contained" color="success" onClick={() => approveSuggestion(s.id, "APPROVED")} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5, flex: 1 }}>Duyệt</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => approveSuggestion(s.id, "REJECTED")} sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5, flex: 1 }}>Từ chối</Button>
                      </>
                    )}
                    {isStudent && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => chooseSuggestion(s)}
                        sx={{ fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5, flex: 1, background: GRADIENT_SV }}
                      >
                        Chọn đề tài
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Tạo gợi ý đề tài mới</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Tên đề tài" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: He thong quan ly nhan su AI" InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField fullWidth select label="Lĩnh vực" value={form.field} onChange={(e) => setForm((p) => ({ ...p, field: e.target.value }))} InputProps={{ sx: { borderRadius: 2 } }}>
              {FIELD_OPTIONS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Mô tả chi tiết" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} multiline rows={4} placeholder="Mô tả nội dung, mục tiêu, yêu cầu của đề tài..." InputProps={{ sx: { borderRadius: 2 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ fontWeight: 700 }}>Huy</Button>
          <Button variant="contained" onClick={createSuggestion} sx={{ fontWeight: 700, background: GRADIENT_GV }}>Tạo gợi ý</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
