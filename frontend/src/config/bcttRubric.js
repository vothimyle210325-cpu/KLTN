import { KLTN_RUBRIC_CRITERIA, KLTN_RUBRIC_MAX_TOTAL } from "./kltnRubric";

/**
 * BCTT dùng giống KLTN 8 tiêu chí, nhưng tổng tối đa = 10.
 * Hiện tại quy đổi theo tỉ lệ (10/12) và làm tròn theo bước 0.25 để tổng = 10.
 */
export const BCTT_RUBRIC_MAX_TOTAL = 10;
const STEP = 0.25;

function roundToStep(x, step) {
  return Math.round(x / step) * step;
}

export const BCTT_RUBRIC_CRITERIA = KLTN_RUBRIC_CRITERIA.map((c) => {
  const scaled = (c.max / KLTN_RUBRIC_MAX_TOTAL) * BCTT_RUBRIC_MAX_TOTAL;
  return { ...c, max: roundToStep(scaled, STEP) };
});

export const BCTT_RUBRIC_MAXS = BCTT_RUBRIC_CRITERIA.map((c) => c.max);

export function emptyBcttRubricValues() {
  return BCTT_RUBRIC_CRITERIA.map(() => "");
}

export function clampBcttRubricValues(raw) {
  return BCTT_RUBRIC_CRITERIA.map((c, i) => {
    const v = Number(raw?.[i]);
    if (Number.isNaN(v) || v < 0) return 0;
    return Math.min(v, c.max);
  });
}

export function sumBcttRubric(values) {
  return clampBcttRubricValues(values).reduce((a, b) => a + b, 0);
}

