import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { alpha } from "@mui/material/styles";
import { loadStudentDashboard, clearMessage } from "../../features/registrationSlice";
import { callApi } from "../../api";

const GRADIENT_BCTT = "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)";
const GRADIENT_KLTN = "linear-gradient(135deg, #dc2626 0%, #f87171 100%)";
const GRADIENT_PHIEU = "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)";
const GRADIENT_REVISION = "linear-gradient(135deg, #059669 0%, #34d399 100%)";
const COLOR_PHIEU = "#0891b2";
const COLOR_REVISION = "#059669";

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

function StatusChip({ status }) {
  if (!status) return <Chip label="Chưa xác định" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />;
  const map = {
    PENDING: { label: "Chờ duyệt", color: "#d97706" },
    APPROVED: { label: "Đã duyệt", color: "#059669" },
    REJECTED: { label: "Từ chối", color: "#dc2626" },
    PASSED: { label: "Dat", color: "#059669" },
    FAILED: { label: "Không đạt", color: "#dc2626" },
    SUBMITTED: { label: "Đã nộp", color: "#0891b2" }
  };
  const s = map[status] || { label: status, color: "#64748b" };
  return <Chip label={s.label} size="small" sx={{ bgcolor: alpha(s.color, 0.1), color: s.color, fontWeight: 700, fontSize: "0.7rem" }} />;
}

function ScoreChip({ score }) {
  if (!score && score !== 0) return <Chip label="Chưa chấm" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem" }} />;
  const num = Number(score);
  const color = num >= 8 ? "#059669" : num >= 5 ? "#d97706" : "#dc2626";
  return <Chip label={score} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: "0.8rem" }} />;
}

function UploadCard({ type, label, sublabel, gradient, accent, file, score, status, onUpload, disabled, description }) {
  const hasFile = !!file;
  return (
    <Box sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${hasFile ? "#059669" : "#e2e8f0"}`, bgcolor: hasFile ? alpha("#059669", 0.02) : "#f8fafc", transition: "all 0.25s", opacity: disabled ? 0.6 : 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha(accent, 0.3)}` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{label}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>{sublabel}</Typography>
          </Box>
        </Stack>
        <Stack spacing={0.5} alignItems="flex-end">
          {hasFile ? (
            <Chip icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>} label="Đã nộp" size="small" sx={{ bgcolor: alpha("#059669", 0.1), color: "#059669", fontWeight: 700, "& .MuiChip-icon": { color: "#059669" } }} />
          ) : (
            <Chip label="Chưa nộp" size="small" sx={{ bgcolor: alpha("#94a3b8", 0.15), color: "#94a3b8", fontWeight: 700 }} />
          )}
          {score !== undefined && <ScoreChip score={score} />}
          {status && <StatusChip status={status} />}
        </Stack>
      </Stack>

      {description && (
        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1.5, fontStyle: "italic" }}>
          {description}
        </Typography>
      )}

      {hasFile && (
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha("#059669", 0.05), border: "1px solid rgba(5,150,105,0.15)", mb: 2 }}>
          <Stack spacing={0.75}>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              File: <strong style={{ color: "#0f172a", wordBreak: "break-all" }}>{file}</strong>
            </Typography>
            {score !== undefined && (
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Điểm: <strong style={{ color: "#0f172a" }}>{score || "Chưa chấm"}</strong>
              </Typography>
            )}
          </Stack>
        </Box>
      )}

      {!disabled && (
        <>
          <Button
            variant={hasFile ? "outlined" : "contained"}
            component="label"
            fullWidth
            startIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            }
            sx={{
              borderRadius: 2, fontWeight: 700, py: 1.5,
              borderColor: alpha(accent, 0.4), color: accent,
              background: hasFile ? "transparent" : gradient,
              "&:hover": { borderColor: accent, bgcolor: alpha(accent, 0.04), boxShadow: `0 4px 12px ${alpha(accent, 0.25)}`, transform: "translateY(-1px)" }
            }}
          >
            {hasFile ? "Tải file mới" : "Chọn file PDF"}
            <input hidden type="file" id={`upload-${type}`} accept="application/pdf" onChange={(e) => onUpload(type, e.target.files?.[0])} />
          </Button>

          <Stack direction="row" spacing={1} mt={1.5} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="Hoac nhap URL Google Drive..."
              onBlur={(e) => { if (e.target.value.trim()) onUpload(type, null, e.target.value.trim()); }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Button size="small" variant="text" onClick={() => {}} sx={{ fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, color: accent }}>
              Lưu URL
            </Button>
          </Stack>
        </>
      )}

      {disabled && (
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha("#94a3b8", 0.08), border: "1px dashed #cbd5e1", textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
            Chưa thể tải lên. Vui lòng hoàn thành bước trước đó.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function StudentUploadPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { dashboard, loading, message, error } = useSelector((s) => s.registration);
  const [uploading, setUploading] = useState(null);
  const [revisionNoteUrl, setRevisionNoteUrl] = useState("");

  useEffect(() => {
    dispatch(loadStudentDashboard(user.email));
  }, [dispatch, user.email]);

  const submissions = dashboard?.submissions || [];
  const revisionRow = (dashboard?.revisions || [])[0];
  const studentStatus = dashboard?.student?.status || "NEW";

  const bcttSub = submissions.find((s) => s.type === "BCTT");
  const kltnSub = submissions.find((s) => s.type === "KLTN");
  const phieuSub = submissions.find((s) => s.type === "PHIEU_TT");
  const revisionSub = submissions.find((s) => s.type === "KLTN_REVISION");

  useEffect(() => {
    setRevisionNoteUrl(revisionRow?.revisionNote || "");
  }, [revisionRow?.revisionNote]);

  // Determine upload eligibility
  const canUploadBCTT = studentStatus === "BCTT_REGISTERED";
  const canUploadPhieu = studentStatus === "BCTT_REGISTERED";
  const canUploadKLTN = studentStatus === "KLTN_REGISTERED" || studentStatus === "COUNCIL_ASSIGNED" || studentStatus === "SUBMITTED";
  const canUploadRevision = studentStatus === "DEFENDED";

  async function syncRevisionRecord(fileUrl) {
    if (!fileUrl) return;
    await callApi("submitRevision", {
      student: user.email,
      kltnFile: fileUrl,
      revisionNote: revisionNoteUrl
    });
  }

  async function saveRevisionBienBanOnly() {
    if (!revisionSub?.file) {
      return;
    }
    setUploading("KLTN_REVISION_NOTE");
    const res = await callApi("submitRevision", {
      student: user.email,
      kltnFile: revisionSub.file,
      revisionNote: revisionNoteUrl
    });
    if (res.ok) dispatch(loadStudentDashboard(user.email));
    setUploading(null);
  }

  async function handleUpload(type, file, url) {
    if (url) {
      setUploading(type);
      const res = await callApi("saveSubmission", { student: user.email, type, file: url });
      if (res.ok) {
        if (type === "KLTN_REVISION") await syncRevisionRecord(url);
        dispatch(loadStudentDashboard(user.email));
      }
      setUploading(null);
    } else if (file) {
      setUploading(type);
      try {
        const base64 = await toBase64(file);
        const uploaded = await callApi("uploadPdfFile", {
          by: user.email, role: "SV", fileName: file.name,
          mimeType: file.type || "application/pdf", base64
        });
        if (uploaded.ok) {
          const fileUrl = uploaded.data?.fileUrl;
          await callApi("saveSubmission", { student: user.email, type, file: fileUrl });
          if (type === "KLTN_REVISION") await syncRevisionRecord(fileUrl);
          dispatch(loadStudentDashboard(user.email));
        }
      } catch (e) { /* silent */ }
      setUploading(null);
    }
  }

  return (
    <Stack spacing={3}>
      {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
      {message && <Alert severity="success" onClose={() => dispatch(clearMessage())} sx={{ borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => dispatch(clearMessage())} sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* Header */}
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ background: "linear-gradient(135deg, #059669 0%, #14b8a6 100%)", p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}>Nộp bài tập & luận văn</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Tải file PDF hoặc nhập link Google Drive</Typography>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Upload Status Summary */}
      <Card sx={{ borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.65rem" }}>Trạng thái đăng ký</Typography>
              <StatusChip status={studentStatus} />
            </Box>
            <Stack direction="row" spacing={1.5}>
              {[
                { label: "BCTT", done: !!bcttSub?.file, active: canUploadBCTT },
                { label: "Phieu TT", done: !!phieuSub?.file, active: canUploadPhieu },
                { label: "KLTN", done: !!kltnSub?.file, active: canUploadKLTN },
                { label: "Chinh sua", done: !!revisionSub?.file, active: canUploadRevision }
              ].map(({ label, done, active }) => (
                <Stack key={label} direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: done ? "#059669" : active ? "#d97706" : "#e2e8f0" }} />
                  <Typography variant="caption" sx={{ fontWeight: active ? 700 : 500, color: done ? "#059669" : active ? "#d97706" : "#94a3b8", fontSize: "0.7rem" }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* BCTT & Phieu */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: "#7c3aed" }} />
          Giai doan BCTT
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} key="BCTT">
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                <UploadCard
                  type="BCTT"
                  label="Bao Cao Thuc Tap (BCTT)"
                  sublabel="File PDF bai bao cao thuc tap"
                  gradient={GRADIENT_BCTT}
                  accent="#7c3aed"
                  file={bcttSub?.file}
                  score={bcttSub?.score}
                  status={bcttSub?.status}
                  onUpload={handleUpload}
                  disabled={!canUploadBCTT}
                  description="Cần nộp BCTT trước khi có thể đăng ký KLTN"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} key="PHIEU_TT">
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                <UploadCard
                  type="PHIEU_TT"
                  label="Phieu Xac Nhan Thuc Tap"
                  sublabel="Xac nhan cua cong ty thuc tap"
                  gradient={GRADIENT_PHIEU}
                  accent={COLOR_PHIEU}
                  file={phieuSub?.file}
                  status={phieuSub?.status}
                  onUpload={handleUpload}
                  disabled={!canUploadPhieu}
                  description="Phieu xac nhan thuc tap cua cong ty. File co dau cong ty va chu ky."
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* KLTN & Revision */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: "#dc2626" }} />
          Giai doan KLTN
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} key="KLTN">
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                <UploadCard
                  type="KLTN"
                  label="Luan Van Tot Nghiep (KLTN)"
                  sublabel="File PDF luan van chinh thuc"
                  gradient={GRADIENT_KLTN}
                  accent="#dc2626"
                  file={kltnSub?.file}
                  score={kltnSub?.score}
                  status={kltnSub?.status}
                  onUpload={handleUpload}
                  disabled={!canUploadKLTN}
                  description="Tải lên bài KLTN trước hạn nộp. GV sẽ tải Turnitin và chấm điểm."
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} key="REVISION">
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                <UploadCard
                  type="KLTN_REVISION"
                  label="Bài KLTN chỉnh sửa"
                  sublabel="Sau khi bảo vệ, chỉnh sửa theo ý kiến hội đồng"
                  gradient={GRADIENT_REVISION}
                  accent={COLOR_REVISION}
                  file={revisionSub?.file}
                  status={revisionSub?.status}
                  onUpload={handleUpload}
                  disabled={!canUploadRevision}
                  description="Nộp file PDF bài đã chỉnh sửa. Kèm link biên bản giải trình (Google Drive) bên dưới — đúng theo mẫu Data KLTN."
                />
                <Box sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", display: "block", mb: 1 }}>
                    Link biên bản giải trình (bắt buộc có khi nộp bài chỉnh sửa)
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="https://drive.google.com/... (file biên bản giải trình các thay đổi)"
                      value={revisionNoteUrl}
                      onChange={(e) => setRevisionNoteUrl(e.target.value)}
                      disabled={!canUploadRevision}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                    <Button
                      variant="outlined"
                      disabled={!canUploadRevision || !revisionSub?.file || uploading === "KLTN_REVISION_NOTE"}
                      onClick={saveRevisionBienBanOnly}
                      sx={{ fontWeight: 700, borderRadius: 2, flexShrink: 0, borderColor: COLOR_REVISION, color: COLOR_REVISION }}
                    >
                      Lưu link biên bản
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Instructions */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>Hướng dẫn nộp bài</Typography>
          <Stack spacing={1.5}>
            {[
              { step: "1", text: "Chuẩn bị file PDF theo đúng định dạng của Khoa (có bìa, mục lục, nội dung)" },
              { step: "2", text: "Kích thước file không vượt quá 20MB" },
              { step: "3", text: "Dat ten file theo cu phap: MSSV_HoTen_DeTai.pdf" },
              { step: "4", text: "Co the nhap URL Google Drive neu file qua lon" },
              { step: "5", text: "Phai hoan thanh BCTT truoc khi co the upload KLTN" }
            ].map(({ step, text }) => (
              <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: alpha("#1e40af", 0.1), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#1e40af", fontSize: "0.7rem" }}>{step}</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const comma = raw.indexOf(",");
      resolve(comma >= 0 ? raw.slice(comma + 1) : raw);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
