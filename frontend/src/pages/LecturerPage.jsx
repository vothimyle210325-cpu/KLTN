import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { callApi } from "../api";
import KLTNScoreRubricDialog from "../components/KLTNScoreRubricDialog";
import { KLTN_RUBRIC_MAX_TOTAL, sumRubric } from "../config/kltnRubric";
import BCTTScoreRubricDialog from "../components/BCTTScoreRubricDialog";
import { BCTT_RUBRIC_MAX_TOTAL, sumBcttRubric } from "../config/bcttRubric";
import { scoreRatioHue } from "../utils/scoreHue";

const TAB_CONFIG = [
  { key: 0, label: "Hướng dẫn", color: "#1e40af", bg: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { key: 1, label: "Phản biện", color: "#7c3aed", bg: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  )},
  { key: 2, label: "Hội đồng", color: "#059669", bg: "linear-gradient(135deg, #059669 0%, #34d399 100%)", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )}
];

const ACTION_MAP = ["getGuidanceList", "getReviewList", "getCouncilList"];

const SectionHeader = ({ icon, title, subtitle, gradient, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
    <Box sx={{
      width: 48, height: 48, borderRadius: 2.5,
      background: gradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
      "& svg": { color: "white" }
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const StatBadge = ({ label, value, color }) => (
  <Box sx={{
    px: 2, py: 1, borderRadius: 2,
    bgcolor: alpha(color, 0.08),
    border: `1px solid ${alpha(color, 0.2)}`,
    textAlign: "center", minWidth: 80
  }}>
    <Typography variant="h6" sx={{ fontWeight: 800, color, lineHeight: 1 }}>
      {value ?? 0}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, color, fontSize: "0.65rem", textTransform: "uppercase" }}>
      {label}
    </Typography>
  </Box>
);

function LecturerPage() {
  const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({});
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [colModel, setColModel] = useState({
    topic: true, type: true, file: true, turnitin: true, score: true
  });
  const [rubricDialog, setRubricDialog] = useState({ open: false, student: null, kind: null, subtitle: "" });

  const cfg = TAB_CONFIG[tab];
  const gradient = cfg.bg;
  const color = cfg.color;

  const scorerRoleForTab = tab === 0 ? "GVHD" : tab === 1 ? "GVPB" : "CHUTICH";

  async function load() {
    setLoading(true);
    const res = await callApi(ACTION_MAP[tab], { email: user.email, role: user.role });
    if (res.ok) setItems(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab, user?.email]);

  async function saveScore(student) {
    const row = items.find((x) => x.student === student);
    const current = draft[student] || {};
    const payload = {
      student,
      type: row?.type || "KLTN",
      score: "",
      comment: current.comment ?? "",
      turnitin: current.turnitin ?? "",
      by: user.email,
      scorerRole: scorerRoleForTab
    };
    if (current.rubric && current.rubric.length) {
      payload.rubric = current.rubric;
    } else {
      payload.score =
        current.score !== undefined && current.score !== ""
          ? current.score
          : (row?.myScore?.score ?? "");
    }
    const res = await callApi("saveScore", payload);
    if (res.ok) {
      setMessage("Đã lưu điểm thành công!");
      load();
    } else {
      setMessage(res.message || "Lỗi khi lưu");
    }
  }

  async function saveRubricDialog({ rubric, note }) {
    const st = rubricDialog.student;
    if (!st) return;
    const row = items.find((x) => x.student === st);
    if (!row) return;
    const res = await callApi("saveScore", {
      student: st,
      type: row.type || "KLTN",
      rubric,
      comment: note,
      turnitin: draft[st]?.turnitin ?? row.turnitin ?? "",
      by: user.email,
      scorerRole: scorerRoleForTab
    });
    if (res.ok) {
      const total = row.type === "BCTT" ? sumBcttRubric(rubric) : sumRubric(rubric);
      setDraft((prev) => ({
        ...prev,
        [st]: { ...(prev[st] || {}), rubric, score: String(total.toFixed(2)), comment: note }
      }));
      setMessage("Đã lưu điểm theo tiêu chí!");
      setRubricDialog({ open: false, student: null, kind: null, subtitle: "" });
      load();
    } else {
      setMessage(res.message || "Lỗi khi lưu");
    }
  }

  async function bulkSave() {
    let saved = 0;
    for (const it of sortedItems) {
      const cur = draft[it.student];
      if (!cur) continue;
      const bulkPayload = {
        student: it.student,
        type: it.type || "KLTN",
        score: "",
        comment: cur.comment ?? "",
        turnitin: cur.turnitin ?? it.turnitin ?? "",
        by: user.email,
        scorerRole: scorerRoleForTab
      };
      if (cur.rubric && cur.rubric.length) {
        bulkPayload.rubric = cur.rubric;
      } else {
        bulkPayload.score =
          cur.score !== undefined && cur.score !== ""
            ? cur.score
            : (it.myScore?.score ?? "");
      }
      await callApi("saveScore", bulkPayload);
      saved++;
    }
    setMessage(`Đã lưu ${saved} điểm thành công!`);
    load();
  }

  const visibleItems = items.filter((x) => {
    const term = keyword.trim().toLowerCase();
    const hit = !term || String(x.student || "").toLowerCase().includes(term) || String(x.topic || "").toLowerCase().includes(term);
    const type = typeFilter === "ALL" || x.type === typeFilter;
    return hit && type;
  });

  const sortedItems = [...visibleItems].sort((a, b) => {
    const cmp = (f) => {
      const av = String(a[f] || "").toLowerCase();
      const bv = String(b[f] || "").toLowerCase();
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    };
    return cmp("student") || cmp("topic");
  });

  const rows = sortedItems.map((it, idx) => ({ id: `${it.student}-${it.type}-${idx}`, ...it }));

  const columns = [
    {
      field: "student",
      headerName: "Sinh viên",
      minWidth: 220,
      flex: 1,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", fontWeight: 800, background: gradient }}>
            {(p.value || "?").charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{p.value}</Typography>
        </Stack>
      )
    },
    {
      field: "topic",
      headerName: "Đề tài",
      minWidth: 260,
      flex: 1.4,
      renderCell: (p) => (
        <Tooltip title={p.value || ""}>
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.value || "—"}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: "type",
      headerName: "Loại",
      width: 100,
      renderCell: (p) => (
        <Chip
          label={p.value}
          size="small"
          sx={{
            bgcolor: alpha(p.value === "KLTN" ? "#7c3aed" : "#0284c7", 0.1),
            color: p.value === "KLTN" ? "#7c3aed" : "#0284c7",
            fontWeight: 700, fontSize: "0.7rem", height: 22,
            border: `1px solid ${alpha(p.value === "KLTN" ? "#7c3aed" : "#0284c7", 0.2)}`
          }}
        />
      )
    },
    {
      field: "file",
      headerName: "File",
      minWidth: 140,
      renderCell: (p) =>
        p.value ? (
          <Button size="small" variant="outlined" href={p.value} target="_blank" rel="noreferrer" sx={{
            fontSize: "0.75rem", fontWeight: 700, py: 0.5, px: 1.5, borderRadius: 1.5,
            borderColor: alpha(color, 0.4), color, minWidth: 0,
            "&:hover": { borderColor: color, bgcolor: alpha(color, 0.04) }
          }}>
            Mở file
          </Button>
        ) : (
          <Chip label="Chưa nộp" size="small" sx={{ bgcolor: alpha("#dc2626", 0.08), color: "#dc2626", fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
        )
    },
    {
      field: "turnitin",
      headerName: "Tỷ lệ trùng lặp (%)",
      minWidth: 200,
      renderCell: (p) => (
        <TextField
          size="small"
          placeholder="VD: 12"
          value={draft[p.row.student]?.turnitin ?? p.row.turnitin ?? ""}
          onChange={(e) => setDraft((prev) => ({
            ...prev,
            [p.row.student]: { ...(prev[p.row.student] || {}), turnitin: e.target.value }
          }))}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      )
    },
    {
      field: "score",
      headerName: "Điểm",
      minWidth: 240,
      renderCell: (p) => {
        const row = p.row;
        const mySc = row.myScore;
        const displayScore =
          draft[row.student]?.score !== undefined && draft[row.student]?.score !== ""
            ? draft[row.student].score
            : (mySc?.score ?? "");
        const hue = scoreRatioHue(displayScore);

        if (row.type === "KLTN") {
          return (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%", flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={
                  displayScore !== "" && displayScore !== null
                    ? `${displayScore} / ${KLTN_RUBRIC_MAX_TOTAL}`
                    : "Chưa chấm"
                }
                sx={{
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  bgcolor: alpha(hue.color, 0.12),
                  color: hue.color
                }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => setRubricDialog({ open: true, student: row.student, kind: "KLTN", subtitle: "" })}
                sx={{ fontWeight: 700, borderRadius: 2, fontSize: "0.72rem", py: 0.25 }}
              >
                Chấm tiêu chí
              </Button>
            </Stack>
          );
        }

        if (row.type === "BCTT") {
          const tf = String(row.topicField || "").toLowerCase();
          const rf = String(row.regField || "").toLowerCase();
          const tn = String(row.topic || "").toLowerCase();
          const blob = `${tf} ${rf} ${tn}`;
          const isResearch = blob.includes("nghiên") || blob.includes("nghien") || blob.includes("nc") || blob.includes("research");
          const isApplication = blob.includes("ứng") || blob.includes("ung") || blob.includes("ud") || blob.includes("application");
          const subtitle =
            scorerRoleForTab === "CHUTICH"
              ? "Hội đồng"
              : scorerRoleForTab === "GVPB"
                ? (isResearch ? "Đề tài nghiên cứu" : isApplication ? "Đề tài ứng dụng" : "")
                : "";

          return (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%", flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={
                  displayScore !== "" && displayScore !== null
                    ? `${displayScore} / ${BCTT_RUBRIC_MAX_TOTAL}`
                    : "Chưa chấm"
                }
                sx={{
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  bgcolor: alpha(hue.color, 0.12),
                  color: hue.color
                }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => setRubricDialog({ open: true, student: row.student, kind: "BCTT", subtitle })}
                sx={{ fontWeight: 700, borderRadius: 2, fontSize: "0.72rem", py: 0.25 }}
              >
                Chấm tiêu chí
              </Button>
            </Stack>
          );
        }

        return (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
            <TextField
              size="small"
              select
              value={draft[row.student]?.score ?? mySc?.score ?? ""}
              onChange={(e) => setDraft((prev) => ({
                ...prev,
                [row.student]: { ...(prev[row.student] || {}), score: e.target.value }
              }))}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value=""><em style={{ fontSize: "0.8rem" }}>Chưa chấm</em></MenuItem>
              {[...Array(11)].map((_, i) => (
                <MenuItem key={i} value={i} sx={{ fontWeight: i >= 8 ? 700 : 400, fontSize: "0.875rem" }}>{i}</MenuItem>
              ))}
            </TextField>
            {displayScore !== "" && displayScore !== null && (
              <Box sx={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                bgcolor: hue.color
              }} />
            )}
          </Stack>
        );
      }
    },
    {
      field: "action",
      headerName: "Thao tác",
      minWidth: 130,
      sortable: false,
      filterable: false,
      renderCell: (p) => {
        const has = draft[p.row.student];
        return (
          <Button
            size="small"
            variant={has ? "contained" : "outlined"}
            onClick={() => saveScore(p.row.student)}
            sx={{
              fontSize: "0.75rem", fontWeight: 700, py: 0.75, px: 1.5, borderRadius: 2,
              background: has ? gradient : "transparent",
              borderColor: alpha(color, 0.4), color: has ? "white" : color,
              "&:hover": { background: gradient, color: "white", borderColor: color, transform: "translateY(-1px)", boxShadow: `0 4px 12px ${alpha(color, 0.3)}` }
            }}
          >
            Luu
          </Button>
        );
      }
    }
  ];

  const scoredCount = sortedItems.filter((it) => {
    const ms = it.myScore;
    const d = draft[it.student];
    const sc = d?.score ?? ms?.score;
    return sc !== undefined && sc !== null && sc !== "";
  }).length;
  const submittedCount = sortedItems.filter((it) => it.file).length;

  return (
    <Stack spacing={2.5}>
      {/* Tab selector */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          {TAB_CONFIG.map((t) => (
            <Box
              key={t.key}
              onClick={() => setTab(t.key)}
              sx={{
                flex: 1,
                py: 2,
                px: 3,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                background: tab === t.key ? t.bg : "transparent",
                color: tab === t.key ? "white" : "#64748b",
                transition: "all 0.2s",
                borderRight: "1px solid #e2e8f0",
                "&:last-child": { borderRight: "none" },
                "&:hover": tab !== t.key ? { bgcolor: alpha(t.color, 0.05), color: t.color } : {}
              }}
            >
              <Box sx={{ "& svg": { color: "inherit" } }}>{t.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
                {t.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {message && (
        <Alert severity={message.includes("Loi") || message.toLowerCase().includes("lỗi") ? "error" : "success"} onClose={() => setMessage("")} sx={{ borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      <KLTNScoreRubricDialog
        open={rubricDialog.open && rubricDialog.kind === "KLTN"}
        onClose={() => setRubricDialog({ open: false, student: null, kind: null, subtitle: "" })}
        onSave={saveRubricDialog}
        accent={color}
        studentLabel={items.find((x) => x.student === rubricDialog.student)?.studentName || rubricDialog.student || ""}
        topicLabel={items.find((x) => x.student === rubricDialog.student)?.topic || ""}
        initialValues={
          draft[rubricDialog.student]?.rubric
          || items.find((x) => x.student === rubricDialog.student)?.myScore?.rubric
        }
        initialNote={
          draft[rubricDialog.student]?.comment
          ?? items.find((x) => x.student === rubricDialog.student)?.myScore?.comment
          ?? ""
        }
      />

      <BCTTScoreRubricDialog
        open={rubricDialog.open && rubricDialog.kind === "BCTT"}
        onClose={() => setRubricDialog({ open: false, student: null, kind: null, subtitle: "" })}
        onSave={saveRubricDialog}
        accent={color}
        rubricSubtitle={rubricDialog.subtitle}
        studentLabel={items.find((x) => x.student === rubricDialog.student)?.studentName || rubricDialog.student || ""}
        topicLabel={items.find((x) => x.student === rubricDialog.student)?.topic || ""}
        initialValues={
          draft[rubricDialog.student]?.rubric
          || items.find((x) => x.student === rubricDialog.student)?.myScore?.rubric
        }
        initialNote={
          draft[rubricDialog.student]?.comment
          ?? items.find((x) => x.student === rubricDialog.student)?.myScore?.comment
          ?? ""
        }
      />

      {/* Stats row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha(color, 0.25)}`, "& svg": { color: "white" } }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{sortedItems.length}</Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Tổng sinh viên</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: "linear-gradient(135deg, #059669 0%, #34d399 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha("#059669", 0.25)}`, "& svg": { color: "white" } }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#059669", lineHeight: 1 }}>{submittedCount}</Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Đã nộp file</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha("#d97706", 0.25)}`, "& svg": { color: "white" } }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#d97706", lineHeight: 1 }}>{scoredCount}</Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Đã chấm điểm</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha("#dc2626", 0.25)}`, "& svg": { color: "white" } }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>{sortedItems.length - submittedCount}</Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Chưa nộp file</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <TextField
                fullWidth
                placeholder="Tìm theo email SV hoặc tên đề tài..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ color: "#94a3b8" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </InputAdornment>,
                  sx: { borderRadius: 2, pl: 0.5 }
                }}
                sx={{ flex: 2 }}
              />
              <TextField
                select size="small" label="Loại" value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <MenuItem value="ALL">Tat ca</MenuItem>
                <MenuItem value="BCTT">BCTT</MenuItem>
                <MenuItem value="KLTN">KLTN</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={load} sx={{
                borderRadius: 2, borderColor: alpha(color, 0.3), color, fontWeight: 700,
                "&:hover": { borderColor: color, bgcolor: alpha(color, 0.04) }
              }}>
                Tải lại
              </Button>
              <Button variant="contained" onClick={bulkSave} sx={{
                borderRadius: 2, background: gradient, fontWeight: 700,
                "&:hover": { boxShadow: `0 4px 12px ${alpha(color, 0.35)}`, transform: "translateY(-1px)" }
              }}>
                Bulk Luu
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              {["topic", "type", "file", "turnitin", "score"].map((field) => (
                <FormControlLabel
                  key={field}
                  control={
                    <Switch
                      size="small"
                      checked={colModel[field] !== false}
                      onChange={(e) => setColModel((p) => ({ ...p, [field]: e.target.checked }))}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: color }
                      }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ fontWeight: 600, color: colModel[field] !== false ? color : "#94a3b8" }}>{field}</Typography>}
                  sx={{ mr: 1.5, mb: 0.25 }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ height: 520 }}>
          {loading && <LinearProgress sx={{ borderRadius: "12px 12px 0 0" }} />}
          {rows.length === 0 && !loading ? (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "#94a3b8", p: 4 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: alpha(color, 0.06), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: "#64748b" }}>Chưa có dữ liệu</Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", maxWidth: 300 }}>
                Không có sinh viên nào trong danh sách {cfg.label.toLowerCase()} của bạn.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 20]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              columnVisibilityModel={colModel}
              onColumnVisibilityModelChange={setColModel}
              localeText={{
                noRowsLabel: "Không có dữ liệu",
                MuiTablePagination: { labelRowsPerPage: "Dòng/trang" }
              }}
              sx={{
                "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2, borderBottom: "2px solid #e2e8f0" },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.8125rem", color: "#334155" },
                "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" }
              }}
            />
          )}
        </Box>
      </Card>
    </Stack>
  );
}

export default LecturerPage;
