import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import {
  BCTT_RUBRIC_CRITERIA,
  BCTT_RUBRIC_MAX_TOTAL,
  clampBcttRubricValues,
  emptyBcttRubricValues,
  sumBcttRubric
} from "../config/bcttRubric";

export default function BCTTScoreRubricDialog({
  open,
  onClose,
  onSave,
  studentLabel,
  topicLabel,
  accent = "#0284c7",
  initialValues,
  initialNote = "",
  rubricSubtitle = ""
}) {
  const [vals, setVals] = useState(() => emptyBcttRubricValues());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialValues && initialValues.length === BCTT_RUBRIC_CRITERIA.length) {
      setVals(initialValues.map((v) => (v === "" || v === null || v === undefined ? "" : String(v))));
    } else {
      setVals(emptyBcttRubricValues());
    }
    setNote(initialNote || "");
  }, [open, initialValues, initialNote]);

  const numeric = clampBcttRubricValues(vals.map((v) => (v === "" ? 0 : v)));
  const total = useMemo(() => sumBcttRubric(vals), [vals]);

  function handleCellChange(i, raw) {
    setVals((prev) => {
      const next = [...prev];
      next[i] = raw;
      return next;
    });
  }

  function handleBlur(i) {
    setVals((prev) => {
      const next = [...prev];
      const max = BCTT_RUBRIC_CRITERIA[i].max;
      let v = Number(next[i]);
      if (Number.isNaN(v) || next[i] === "") {
        next[i] = "";
        return next;
      }
      if (v < 0) v = 0;
      if (v > max) v = max;
      next[i] = String(v);
      return next;
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>
        Chấm điểm BCTT theo tiêu chí {rubricSubtitle ? <span style={{ color: accent }}>({rubricSubtitle})</span> : null}
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, pb: 1, color: "#64748b", fontWeight: 500 }}>
        {studentLabel}
        {topicLabel ? ` — ${topicLabel}` : ""}
      </Typography>
      <DialogContent>
        <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 800, color: "#0f172a" }}>Tên tiêu chí</TableCell>
                <TableCell align="center" width={110} sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Điểm tối đa
                </TableCell>
                <TableCell align="center" width={120} sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Đạt được
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {BCTT_RUBRIC_CRITERIA.map((c, i) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#334155" }}>{c.label}</TableCell>
                  <TableCell align="center">{c.max}</TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: c.max, step: 0.25 }}
                      value={vals[i]}
                      onChange={(e) => handleCellChange(i, e.target.value)}
                      onBlur={() => handleBlur(i)}
                      sx={{ width: 100, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: alpha(accent, 0.06) }}>
                <TableCell sx={{ fontWeight: 800 }}>Tổng</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  {BCTT_RUBRIC_MAX_TOTAL}
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontWeight: 800, color: accent, fontSize: "1.1rem" }}>{total.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b" }}>
            Nhận xét chung
          </Typography>
          <TextField
            multiline
            minRows={2}
            fullWidth
            placeholder="Ghi chú thêm cho sinh viên (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave({ rubric: numeric, note })}
          sx={{ fontWeight: 800, borderRadius: 2, bgcolor: accent, "&:hover": { bgcolor: accent } }}
        >
          Lưu điểm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

