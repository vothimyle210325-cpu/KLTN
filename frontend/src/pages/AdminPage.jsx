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
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";

const GRADIENT = "linear-gradient(135deg, #dc2626 0%, #f87171 100%)";
const COLOR = "#dc2626";

const ROLE_CONFIG = {
  ADMIN: { label: "Quản Trị", color: "#dc2626" },
  TBM: { label: "Trưởng Bộ Môn", color: "#7c3aed" },
  GV: { label: "Giảng Viên", color: "#7c3aed" },
  THUKY: { label: "Thư Ký HĐ", color: "#059669" },
  CHUTICH: { label: "Chủ Tịch HĐ", color: "#059669" },
  SV: { label: "Sinh Viên", color: "#0284c7" }
};

const STATUS_CONFIG = {
  APPROVED: { label: "Hoạt động", color: "#059669" },
  PENDING: { label: "Chờ duyệt", color: "#d97706" },
  REJECTED: { label: "Từ chối", color: "#dc2626" },
  INACTIVE: { label: "Khóa", color: "#64748b" }
};

function StatusChip({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{
        bgcolor: alpha(c.color, 0.1),
        color: c.color,
        border: `1px solid ${alpha(c.color, 0.25)}`,
        fontWeight: 700, fontSize: "0.7rem", height: 22
      }}
    />
  );
}

function RoleChip({ role }) {
  const c = ROLE_CONFIG[role] || { label: role, color: "#64748b" };
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{
        bgcolor: alpha(c.color, 0.1),
        color: c.color,
        border: `1px solid ${alpha(c.color, 0.25)}`,
        fontWeight: 700, fontSize: "0.7rem", height: 22
      }}
    />
  );
}

export default function AdminPage() {
  const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState({ keyword: "", role: "ALL", status: "ALL" });

  // Edit user dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Role change dialog
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Deactivate dialog
  const [deactOpen, setDeactOpen] = useState(false);
  const [deactTarget, setDeactTarget] = useState(null);

  async function loadUsers() {
    setLoading(true);
    const res = await callApi("getAllUsers", { by: user.email, role: user.role });
    if (res.ok) setUsers(res.data || []);
    setLoading(false);
  }

  async function loadAudits() {
    const res = await callApi("getAuditLogs", { by: user.email, role: user.role });
    if (res.ok) setAudits(res.data || []);
  }

  useEffect(() => {
    loadUsers();
    loadAudits();
  }, []);

  function openEdit(u) { setEditUser(u); setEditForm({ name: u.name || "", phone: u.phone || "", major: u.major || "", mssv: u.mssv || "", address: u.address || "", note: u.note || "" }); setEditOpen(true); }
  function openRole(u) { setRoleTarget(u); setNewRole(u.role || "SV"); setRoleOpen(true); }
  function openDeact(u) { setDeactTarget(u); setDeactOpen(true); }

  async function saveUserEdit() {
    const res = await callApi("updateUserProfile", { email: editUser.email, ...editForm, by: user.email, role: user.role });
    if (res.ok) { setMessage("Cập nhật thông tin thành công!"); setEditOpen(false); loadUsers(); }
    else setMessage(res.message || "Lỗi khi lưu");
  }

  async function changeRole() {
    const res = await callApi("changeUserRole", { email: roleTarget.email, role: newRole, by: user.email, actorRole: user.role });
    if (res.ok) { setMessage(`Đã đổi vai trò thành ${ROLE_CONFIG[newRole]?.label || newRole}!`); setRoleOpen(false); loadUsers(); }
    else setMessage(res.message || "Lỗi đổi vai trò");
  }

  async function deactivateUser() {
    const res = await callApi("deactivateUser", { email: deactTarget.email, by: user.email, role: user.role });
    if (res.ok) { setMessage("Đã khóa tài khoản!"); setDeactOpen(false); loadUsers(); }
    else setMessage(res.message || "Lỗi khóa tài khoản");
  }

  async function activateUser(email) {
    const res = await callApi("activateUser", { email, by: user.email, role: user.role });
    if (res.ok) { setMessage("Đã kích hoạt tài khoản!"); loadUsers(); }
    else setMessage(res.message || "Lỗi kích hoạt");
  }

  async function exportCsv() {
    const rows = [["Họ tên", "Email", "MSSV", "Chuyên ngành", "Vai trò", "Trạng thái", "Ngày tạo"]];
    filtered.forEach((u) => rows.push([u.name, u.email, u.mssv || u.studentId || "", u.major || "", u.role, u.status, u.createdAt || ""]));
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `quan-ly-nguoi-dung-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  }

  const filtered = users.filter((u) => {
    const kw = filter.keyword.trim().toLowerCase();
    const hit = !kw || String(u.name || "").toLowerCase().includes(kw) || String(u.email || "").toLowerCase().includes(kw) || String(u.mssv || "").toLowerCase().includes(kw);
    const roleOk = filter.role === "ALL" || u.role === filter.role;
    const statusOk = filter.status === "ALL" || u.status === filter.status;
    return hit && roleOk && statusOk;
  });

  const rows = filtered.map((u, i) => ({ id: u.email || i, ...u }));
  const auditRows = audits.map((a, i) => ({ id: i, ...a }));

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "APPROVED").length,
    pending: users.filter((u) => u.status === "PENDING").length,
    inactive: users.filter((u) => u.status === "INACTIVE" || u.status === "REJECTED").length,
    byRole: users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
  };

  const columns = [
    {
      field: "name", headerName: "Người dùng", minWidth: 220, flex: 1,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 36, height: 36, fontSize: "0.8rem", fontWeight: 800, background: ROLE_CONFIG[p.row.role]?.color ? `linear-gradient(135deg, ${ROLE_CONFIG[p.row.role].color} 0%, ${ROLE_CONFIG[p.row.role].color}99 100%)` : GRADIENT }}>
            {(p.value || "?").charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>{p.row.email}</Typography>
          </Box>
        </Stack>
      )
    },
    { field: "mssv", headerName: "MSSV", width: 120 },
    { field: "major", headerName: "Chuyên ngành", minWidth: 160, flex: 1 },
    { field: "role", headerName: "Vai trò", width: 140, renderCell: (p) => <RoleChip role={p.value} /> },
    { field: "status", headerName: "Trạng thái", width: 130, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: "createdAt", headerName: "Ngày tạo", minWidth: 140, flex: 1 },
    {
      field: "actions", headerName: "Thao tác", minWidth: 280, sortable: false, filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="outlined" onClick={() => openEdit(p.row)} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5, borderColor: alpha(COLOR, 0.4), color: COLOR, minWidth: 0, px: 1 }}>
            Sửa
          </Button>
          <Button size="small" variant="outlined" onClick={() => openRole(p.row)} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5, borderColor: alpha("#7c3aed", 0.4), color: "#7c3aed", minWidth: 0, px: 1 }}>
            Đổi role
          </Button>
          {p.row.status === "APPROVED" || p.row.status === "INACTIVE" ? (
            <Button size="small" variant="outlined" color="error" onClick={() => openDeact(p.row)} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5, minWidth: 0, px: 1 }}>
              Khóa
            </Button>
          ) : (
            <Button size="small" variant="contained" color="success" onClick={() => activateUser(p.row.email)} sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5, minWidth: 0, px: 1 }}>
              Mở
            </Button>
          )}
        </Stack>
      )
    }
  ];

  const auditColumns = [
    { field: "ts", headerName: "Thời gian", minWidth: 170, flex: 1 },
    { field: "actor", headerName: "Người thực hiện", minWidth: 200, flex: 1 },
    { field: "role", headerName: "Vai trò", width: 120, renderCell: (p) => <RoleChip role={p.value} /> },
    { field: "action", headerName: "Hành động", minWidth: 200, flex: 1 },
    { field: "target", headerName: "Đối tượng", minWidth: 200, flex: 1 },
    { field: "detail", headerName: "Chi tiết", minWidth: 220, flex: 1.2 }
  ];

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity={message.includes("Lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>{message}</Alert>}

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, "& .MuiTab-root": { fontWeight: 700, fontSize: "0.875rem", textTransform: "none", minHeight: 52 }, "& .Mui-selected": { color: COLOR } }}>
            <Tab label="Quản lý người dùng" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} iconPosition="start" />
            <Tab label="Nhật ký hệ thống" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} iconPosition="start" />
            <Tab label="Thống kê" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 0: User Management */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Stats */}
            <Grid container spacing={2} mb={3}>
              {[
                { label: "Tổng người dùng", value: stats.total, color: COLOR },
                { label: "Đang hoạt động", value: stats.active, color: "#059669" },
                { label: "Chờ duyệt", value: stats.pending, color: "#d97706" },
                { label: "Đã khóa", value: stats.inactive, color: "#64748b" }
              ].map(({ label, value, color }) => (
                <Grid item xs={6} sm={3} key={label}>
                  <Box sx={{ p: 2, borderRadius: 2.5, border: `1.5px solid ${alpha(color, 0.2)}`, bgcolor: alpha(color, 0.04) }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Filters */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems="center">
              <TextField
                fullWidth
                placeholder="Tìm theo tên, email hoặc MSSV..."
                value={filter.keyword}
                onChange={(e) => setFilter((p) => ({ ...p, keyword: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></InputAdornment>, sx: { borderRadius: 2, pl: 0.5 } }}
                sx={{ flex: 2 }}
              />
              <TextField select size="small" label="Vai trò" value={filter.role} onChange={(e) => setFilter((p) => ({ ...p, role: e.target.value }))} sx={{ minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                <MenuItem value="ALL">Tất cả vai trò</MenuItem>
                {Object.entries(ROLE_CONFIG).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Trạng thái" value={filter.status} onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                <MenuItem value="ALL">Tất cả</MenuItem>
                <MenuItem value="APPROVED">Hoạt động</MenuItem>
                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                <MenuItem value="INACTIVE">Khóa</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={loadUsers} sx={{ borderRadius: 2, borderColor: alpha(COLOR, 0.3), color: COLOR, fontWeight: 700 }}>Tải lại</Button>
              <Button variant="contained" onClick={exportCsv} sx={{ borderRadius: 2, background: GRADIENT, fontWeight: 700 }}>Export CSV</Button>
            </Stack>

            {/* Role breakdown */}
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b", mr: 1, alignSelf: "center" }}>Phân bổ vai trò:</Typography>
              {Object.entries(stats.byRole).map(([role, count]) => (
                <Chip key={role} label={`${ROLE_CONFIG[role]?.label || role}: ${count}`} size="small" sx={{ bgcolor: alpha(ROLE_CONFIG[role]?.color || "#64748b", 0.1), color: ROLE_CONFIG[role]?.color || "#64748b", fontWeight: 700, fontSize: "0.75rem", height: 24 }} />
              ))}
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
          </Box>
        )}

        {/* Tab 1: Audit Log */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${alpha(COLOR, 0.3)}` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Nhật ký hệ thống</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>{audits.length} hoạt động gần đây</Typography>
              </Box>
            </Stack>
            <Box sx={{ height: 520 }}>
              <DataGrid
                rows={auditRows}
                columns={auditColumns}
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
          </Box>
        )}

        {/* Tab 2: Statistics */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Phân bổ theo vai trò</Typography>
                    <Stack spacing={1.5}>
                      {Object.entries(stats.byRole).map(([role, count]) => {
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        const c = ROLE_CONFIG[role]?.color || "#64748b";
                        return (
                          <Box key={role}>
                            <Stack direction="row" justifyContent="space-between" mb={0.25}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>
                                {ROLE_CONFIG[role]?.label || role}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: c }}>{count} người</Typography>
                            </Stack>
                            <Box sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                              <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 4, bgcolor: c, transition: "width 0.4s" }} />
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Trạng thái tài khoản</Typography>
                    <Stack spacing={1.5}>
                      {[
                        { label: "Hoạt động", count: stats.active, total: stats.total, color: "#059669" },
                        { label: "Chờ duyệt", count: stats.pending, total: stats.total, color: "#d97706" },
                        { label: "Khóa / Từ chối", count: stats.inactive, total: stats.total, color: "#dc2626" }
                      ].map(({ label, count, total, color }) => {
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <Box key={label}>
                            <Stack direction="row" justifyContent="space-between" mb={0.25}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>{label}</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 800, color }}>{count} / {total}</Typography>
                            </Stack>
                            <Box sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                              <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 4, bgcolor: color, transition: "width 0.4s" }} />
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ background: GRADIENT, width: 36, height: 36, fontSize: "0.875rem" }}>{(editUser?.name || "?").charAt(0).toUpperCase()}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Chỉnh sửa: {editUser?.name}</Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>{editUser?.email}</Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Họ và tên" value={editForm.name || ""} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            <TextField fullWidth size="small" label="Số điện thoại" value={editForm.phone || ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            <TextField fullWidth size="small" label="Mã số sinh viên" value={editForm.mssv || ""} onChange={(e) => setEditForm((p) => ({ ...p, mssv: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            <TextField fullWidth size="small" label="Chuyên ngành" value={editForm.major || ""} onChange={(e) => setEditForm((p) => ({ ...p, major: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            <TextField fullWidth size="small" label="Địa chỉ" value={editForm.address || ""} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            <TextField fullWidth size="small" label="Ghi chú" multiline rows={2} value={editForm.note || ""} onChange={(e) => setEditForm((p) => ({ ...p, note: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 700 }}>Hủy</Button>
          <Button variant="contained" onClick={saveUserEdit} sx={{ fontWeight: 700, background: GRADIENT }}>Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleOpen} onClose={() => setRoleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Đổi vai trò người dùng
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Thay đổi vai trò của <strong>{roleTarget?.email}</strong>
            </Typography>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", mb: 0.75, display: "block" }}>Vai trò hiện tại:</Typography>
              <RoleChip role={roleTarget?.role} />
            </Box>
            <TextField
              fullWidth select size="small" label="Vai trò mới" value={newRole} onChange={(e) => setNewRole(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                <MenuItem key={k} value={k} sx={{ fontWeight: k === newRole ? 700 : 400 }}>
                  {v.label}
                </MenuItem>
              ))}
            </TextField>
            {newRole !== roleTarget?.role && (
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: "0.8125rem" }}>
                Người dùng sẽ có quyền truy cập của <strong>{ROLE_CONFIG[newRole]?.label}</strong> sau khi lưu.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleOpen(false)} sx={{ fontWeight: 700 }}>Hủy</Button>
          <Button variant="contained" onClick={changeRole} disabled={newRole === roleTarget?.role} sx={{ fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
            Xác nhận đổi vai trò
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactOpen} onClose={() => setDeactOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#dc2626", pb: 1 }}>Khóa tài khoản</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#475569", mt: 1 }}>
            Bạn có chắc muốn khóa tài khoản <strong>{deactTarget?.email}</strong>? Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeactOpen(false)} sx={{ fontWeight: 700 }}>Hủy</Button>
          <Button variant="contained" color="error" onClick={deactivateUser} sx={{ fontWeight: 700 }}>
            Xác nhận khóa
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
