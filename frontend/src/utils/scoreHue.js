/**
 * Màu theo tỷ lệ điểm: thang 0–10 (BCTT / cũ) hoặc 0–12 (rubric KLTN).
 */
export function scoreRatioHue(score) {
  const n = Number(score);
  if (score === "" || score === null || score === undefined || Number.isNaN(n)) {
    return { color: "#94a3b8", ratio: 0 };
  }
  const max = n > 10 ? 12 : 10;
  const ratio = n / max;
  const color = ratio >= 0.8 ? "#059669" : ratio >= 0.5 ? "#d97706" : "#dc2626";
  return { color, ratio };
}
