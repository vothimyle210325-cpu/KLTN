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

const GRADIENT = "linear-gradient(135deg, #dc2626 0%, #f87171 100%)";
const COLOR = "#dc2626";

const StatusChip = ({ status }) => {
  const map = { PENDING: { label: "Chờ duyệt", color: "#d97706" }, APPROVED: { label: "Đã duyệt", color: "#059669" }, REJECTED: { label: "Đã từ chối", color: "#dc2626" } };
  const c = map[status] || { label: status || "Mới", color: "#0284c7" };
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

export default function AccountsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState({ keyword: "", status: "ALL", role: "ALL" });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, byRole: {} });
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  async function load() {
    setLoading(true);
    const res = await callApi("getAllUsers");
    if (res.ok) {
      const allUsers = Array.isArray(res.data) ? res.data : [];
      setUsers(allUsers);
      const pending = allUsers.filter((u) => u.status === "PENDING").length;
      const approved = allUsers.filter((u) => u.status === "APPROVED").length;
      const rejected = allUsers.filter((u) => u.status === "REJECTED").length;
      const byRole = {};
      allUsers.forEach((u) => {
        const r = u.role || "UNKNOWN";
        byRole[r] = (byRole[r] || 0) + 1;
      });
      setStats({ total: allUsers.length, pending, approved, rejected, byRole });
      setMessage("");
    } else {
      setUsers([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0, byRole: {} });
      setMessage(res.message || "Lỗi tải danh sách tài khoản");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openDetail(user) { setSelectedUser(user); setDetailOpen(true); }
  function openReject(user) { setSelectedUser(user); setRejectReason(""); setRejectOpen(true); }

  async function approveUser(email) {
    const res = await callApi("approveUser", { email, status: "APPROVED", by: "admin", role: "ADMIN" });
    if (res.ok) { setMessage(`Đã duyệt tài khoản: ${email}`); setDetailOpen(false); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function rejectUser() {
    const res = await callApi("rejectUser", { email: selectedUser?.email, status: "REJECTED", by: "admin", role: "ADMIN", reason: rejectReason });
    if (res.ok) { setMessage(`Đã từ chối: ${selectedUser?.email}`); setRejectOpen(false); setDetailOpen(false); load(); }
    else setMessage(res.message || "Lỗi");
  }

  async function bulkApprove() {
    const pending = users.filter((u) => u.status === "PENDING");
    if (!pending.length) return;
    let count = 0;
    for (const u of pending) {
      await callApi("approveUser", { email: u.email, status: "APPROVED", by: "admin", role: "ADMIN" });
      count++;
    }
    setMessage(`Đã duyệt ${count} tài khoản!`);
    load();
  }

  async function exportCsv() {
    const rows = [["Họ tên", "Email", "MSSV", "Chuyên ngành", "Vai trò", "Trạng thái", "Ngày tạo"]];
    filtered.forEach((u) => rows.push([u.name, u.email, u.mssv, u.major, u.role, u.status, u.createdAt]));
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tai-khoan-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  }

  const filtered = users.filter((u) => {
    const kw = filter.keyword.trim().toLowerCase();
    const hit = !kw || String(u.email || "").toLowerCase().includes(kw) || String(u.name || "").toLowerCase().includes(kw) || String(u.mssv || "").toLowerCase().includes(kw);
    const statusOk = filter.status === "ALL" || u.status === filter.status;
    const roleOk = filter.role === "ALL" || u.role === filter.role;
    return hit && statusOk && roleOk;
  });

  const rows = filtered.map((u, i) => ({ id: `${u.email}-${i}`, ...u }));

  const columns = [
    {
      field: "name", headerName: "Họ tên", minWidth: 180, flex: 1,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, fontSize: "0.75rem", fontWeight: 800, background: GRADIENT }}>{(p.value || "?").charAt(0).toUpperCase()}</Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography>
        </Stack>
      )
    },
    { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
    { field: "mssv", headerName: "MSSV", width: 120 },
    { field: "major", headerName: "Chuyên ngành", width: 160 },
    {
      field: "role", headerName: "Vai trò", width: 120,
      renderCell: (p) => {
        const colors = { SV: "#0284c7", GV: "#7c3aed", TBM: "#7c3aed", ADMIN: "#dc2626", THUKY: "#059669", CHUTICH: "#059669" };
        return <Chip label={p.value} size="small" sx={{ bgcolor: alpha(colors[p.value] || "#64748b", 0.1), color: colors[p.value] || "#64748b", fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
      }
    },
    { field: "status", headerName: "Trạng thái", width: 130, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: "createdAt", headerName: "Ngày tạo", minWidth: 140, flex: 1 },
    {
      field: "action", headerName: "Hành động", minWidth: 240, sortable: false, filterable: false,
      renderCell: (p) => {
        if (p.row.status === "PENDING") {
          return (
            <Stack direction="row" spacing={0.5}>
              <Button size="small" variant="contained" color="success" onClick={() => approveUser(p.row.email)} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }}>
                Duyệt
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => openReject(p.row)} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }}>
                Từ chối
              </Button>
              <Button size="small" variant="text" onClick={() => openDetail(p.row)} sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>
                Chi tiết
              </Button>
            </Stack>
          );
        }
        return <Button size="small" variant="text" onClick={() => openDetail(p.row)} sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>Chi tiết</Button>;
      }
    }
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Stats */}
      <Grid container spacing={2}>
        {[
          { label: "Tổng tài khoản", value: stats.total, color: COLOR, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
          { label: "Chờ duyệt", value: stats.pending, color: "#d97706", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: "Đã duyệt", value: stats.approved, color: "#059669", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Đã từ chối", value: stats.rejected, color: "#dc2626", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
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

      {/* Role breakdown */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>Phan bo theo vai tro</Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {Object.entries(stats.byRole).map(([role, count]) => {
              const colors = { SV: "#0284c7", GV: "#7c3aed", TBM: "#7c3aed", ADMIN: "#dc2626", THUKY: "#059669", CHUTICH: "#059669" };
              const labels = { SV: "Sinh Viên", GV: "Giảng Viên", TBM: "Trưởng Bộ Môn", ADMIN: "Quản Trị", THUKY: "Thư Ký", CHUTICH: "Chủ Tịch" };
              return (
                <Chip
                  key={role}
                  label={`${labels[role] || role}: ${count}`}
                  sx={{ bgcolor: alpha(colors[role] || "#64748b", 0.1), color: colors[role] || "#64748b", fontWeight: 700, fontSize: "0.8rem", height: 28 }}
                />
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Main table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
            <Box sx={{ flex: 1 }}>
              <SectionHeader
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
                title="Quản lý tài khoản"
                subtitle={`${stats.pending} tài khoản đang chờ duyệt`}
                gradient={GRADIENT}
                color={COLOR}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              {stats.pending > 0 && (
                <Button size="small" variant="contained" color="success" onClick={bulkApprove} sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Duyệt tất cả ({stats.pending})
                </Button>
              )}
              <Button size="small" variant="outlined" onClick={exportCsv} sx={{ borderRadius: 2, fontWeight: 700, borderColor: alpha(COLOR, 0.3), color: COLOR }}>Export CSV</Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Tìm theo email, tên hoặc MSSV..."
              value={filter.keyword}
              onChange={(e) => setFilter((p) => ({ ...p, keyword: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></InputAdornment>, sx: { borderRadius: 2, pl: 0.5 } }}
              sx={{ flex: 2 }}
            />
            <TextField select size="small" label="Trạng thái" value={filter.status} onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tat ca</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            </TextField>
            <TextField select size="small" label="Vai trò" value={filter.role} onChange={(e) => setFilter((p) => ({ ...p, role: e.target.value }))} sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <MenuItem value="ALL">Tat ca</MenuItem>
              <MenuItem value="SV">Sinh viên</MenuItem>
              <MenuItem value="GV">Giảng viên</MenuItem>
              <MenuItem value="TBM">Trưởng bộ môn</MenuItem>
              <MenuItem value="ADMIN">Quản trị</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={load} sx={{ borderRadius: 2, borderColor: alpha(COLOR, 0.3), color: COLOR, fontWeight: 700, "&:hover": { borderColor: COLOR, bgcolor: alpha(COLOR, 0.04) } }}>
              Tải lại
            </Button>
          </Stack>

          <Box sx={{ height: 480 }}>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Chi tiết tài khoản</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Stack spacing={2}>
              {[
                { label: "Họ và tên", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "MSSV", value: selectedUser.mssv },
                { label: "Chuyên ngành", value: selectedUser.major },
                { label: "Vai trò", value: selectedUser.role },
                { label: "Trạng thái", value: <StatusChip status={selectedUser.status} /> },
                { label: "Ngày tạo", value: selectedUser.createdAt },
                { label: "Số điện thoại", value: selectedUser.phone || "—" },
                { label: "Ghi chú", value: selectedUser.note || "—" }
              ].map(({ label, value }) => (
                <Stack key={label} direction="row" spacing={2} alignItems="flex-start">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748b", minWidth: 120 }}>{label}:</Typography>
                  {typeof value === "string" ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", flex: 1, wordBreak: "break-all" }}>{value}</Typography>
                  ) : value}
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ fontWeight: 700 }}>Dong</Button>
          {selectedUser?.status === "PENDING" && (
            <>
              <Button variant="outlined" color="error" onClick={() => { setDetailOpen(false); openReject(selectedUser); }} sx={{ fontWeight: 700 }}>Từ chối</Button>
              <Button variant="contained" color="success" onClick={() => approveUser(selectedUser.email)} sx={{ fontWeight: 700 }}>Duyệt ngay</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#dc2626", pb: 1 }}>Từ chối tài khoản</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Bạn sẽ từ chối tài khoản <strong>{selectedUser?.email}</strong>. Hãy nhập lý do.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Lý do từ chối"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Thông tin không chính xác, MSSV không tồn tại..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectOpen(false)} sx={{ fontWeight: 700 }}>Huy</Button>
          <Button variant="contained" color="error" onClick={rejectUser} disabled={!rejectReason.trim()} sx={{ fontWeight: 700 }}>
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
