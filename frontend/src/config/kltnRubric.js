/**
 * Bảng tiêu chí KLTN — khớp cấu trúc sheet (Tên TC | Điểm tối đa).
 * Tổng tối đa: 12 điểm.
 */
export const KLTN_RUBRIC_MAX_TOTAL = 12;

export const KLTN_RUBRIC_CRITERIA = [
  { id: "TC1", label: "Đặt vấn đề — Lý do chọn đề tài", max: 1 },
  { id: "TC2", label: "Nội dung — Cơ sở lý thuyết", max: 1 },
  { id: "TC3", label: "Nội dung — Phân tích, đánh giá", max: 2 },
  { id: "TC4", label: "Nội dung — Giải pháp", max: 2 },
  { id: "TC5", label: "Hình thức — Cấu trúc, câu văn và từ ngữ", max: 2 },
  { id: "TC6", label: "Hình thức — Trích dẫn và tài liệu tham khảo", max: 1 },
  { id: "TC7", label: "Tính sáng tạo — tính mới", max: 1 },
  {
    id: "TC8",
    label: "Điểm cộng — Viết bằng tiếng Anh (Max 1đ), viết bài báo khoa học (Max 1đ)",
    max: 2
  }
];

export function emptyRubricValues() {
  return KLTN_RUBRIC_CRITERIA.map(() => "");
}

export function clampRubricValues(raw) {
  return KLTN_RUBRIC_CRITERIA.map((c, i) => {
    const v = Number(raw?.[i]);
    if (Number.isNaN(v) || v < 0) return 0;
    return Math.min(v, c.max);
  });
}

export function sumRubric(values) {
  return clampRubricValues(values).reduce((a, b) => a + b, 0);
}
