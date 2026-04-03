# -*- coding: utf-8 -*-
"""
KLTN Portal Database Template Generator
Tạo file Excel template đầy đủ cho hệ thống KLTN Portal
Chạy: python create_db_template.py
"""

import openpyxl
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side,
    GradientFill
)
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule, FormulaRule
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.series import SeriesLabel
from datetime import datetime, timedelta
import os

# =====================================================================
# CONSTANTS & STYLES
# =====================================================================

# Color palette
C = {
    "header_bg":      "1E3A5F",   # Dark navy - primary header
    "header_fg":      "FFFFFF",   # White text on dark header
    "sub_header_bg":   "2563EB",   # Blue - secondary header
    "sub_header_fg":   "FFFFFF",
    "alt_row":        "EFF6FF",   # Light blue tint for alternating rows
    "border":         "CBD5E1",   # Slate border
    "success_bg":     "059669",   # Green
    "warning_bg":     "D97706",   # Amber
    "danger_bg":      "DC2626",   # Red
    "purple_bg":      "7C3AED",   # Purple
    "teal_bg":        "0891B2",   # Cyan
    "light_bg":       "F8FAFC",   # Very light gray
    "white":          "FFFFFF",
    "text_dark":      "0F172A",   # Near black
    "text_muted":     "64748B",   # Gray text
    "highlight":      "FEF9C3",   # Yellow highlight
}

def make_fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def make_border(style="thin"):
    s = Side(style=style, color=C["border"])
    return Border(left=s, right=s, top=s, bottom=s)

def make_font(bold=False, color=None, size=10, italic=False):
    kw = dict(bold=bold, size=size, italic=italic)
    if color:
        kw["color"] = color
    return Font(**kw)

def make_align(h="left", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)


# =====================================================================
# SHEET DEFINITIONS
# =====================================================================

SHEETS = {
    "0_USERS": {
        "desc": "Tài khoản người dùng - SV/GV/TBM/THUKY/CHUTICH/ADMIN",
        "columns": [
            ("email",             "Email (PK)",                  35, "Email đăng nhập, KHÔNG TRÙNG. Ví dụ: sv01@univ.edu.vn"),
            ("password",          "Mật khẩu",                    18, "Mật khẩu đăng nhập (plain text, mã hóa ở BE)"),
            ("name",              "Họ tên đầy đủ",               28, "Họ và tên. Ví dụ: Nguyễn Văn An"),
            ("role",              "Vai trò",                     15, "SV | GV | TBM | THUKY | CHUTICH | ADMIN"),
            ("major",             "Chuyên ngành",                 18, "CNTT | HTTT | AT | KTMT | KHMT | TKPM"),
            ("phone",             "SĐT",                         15, "Số điện thoại liên hệ (không bắt buộc)"),
            ("mssv",              "MSSV",                        12, "Mã số sinh viên (chỉ dùng cho SV)"),
            ("status",            "Trạng thái",                  15, "PENDING | APPROVED | INACTIVE | REJECTED"),
            ("createdAt",         "Ngày tạo",                    20, "Ngày tạo tài khoản (YYYY-MM-DD hoặc ISO)"),
        ],
        "data": [
            ["sv01@univ.edu.vn",  "123456", "Nguyen Van An",      "SV",      "CNTT", "0901000001", "20520001", "APPROVED", "2026-01-10"],
            ["sv02@univ.edu.vn",  "123456", "Tran Thi Binh",        "SV",      "HTTT", "0901000002", "20520002", "APPROVED", "2026-01-10"],
            ["sv03@univ.edu.vn",  "123456", "Le Van Cuong",         "SV",      "CNTT", "0901000003", "20520003", "APPROVED", "2026-01-12"],
            ["sv04@univ.edu.vn",  "123456", "Pham Thi Dung",       "SV",      "AT",   "0901000004", "20520004", "APPROVED", "2026-01-12"],
            ["sv05@univ.edu.vn",  "123456", "Hoang Van Em",         "SV",      "KHMT", "0901000005", "20520005", "PENDING",  "2026-01-15"],
            ["gv01@univ.edu.vn",  "123456", "TS. Le Hung Cuong",   "GV",      "CNTT", "0901000101", "",         "APPROVED", "2026-01-05"],
            ["gv02@univ.edu.vn",  "123456", "PGS.TS. Tran Thu Ha", "GV",      "HTTT", "0901000102", "",         "APPROVED", "2026-01-05"],
            ["gv03@univ.edu.vn",  "123456", "ThS. Nguyen Van Duc",  "GV",      "CNTT", "0901000103", "",         "APPROVED", "2026-01-06"],
            ["gv04@univ.edu.vn",  "123456", "TS. Pham Thi Lan",     "GV",      "AT",   "0901000104", "",         "APPROVED", "2026-01-06"],
            ["tbm@univ.edu.vn",   "123456", "PGS.TS. Tran Dinh Khoa","TBM",    "CNTT", "0901000000", "",         "APPROVED", "2026-01-01"],
            ["thuky@univ.edu.vn", "123456", "ThS. Le Thi Mai",     "THUKY",   "CNTT", "0901000020", "",         "APPROVED", "2026-01-01"],
            ["chutich@univ.edu.vn","123456","PGS.TS. Hoang Minh Son","CHUTICH","CNTT", "0901000030", "",         "APPROVED", "2026-01-01"],
            ["admin@univ.edu.vn", "admin123","System Administrator", "ADMIN",   "CNTT", "0901000099", "",         "APPROVED", "2026-01-01"],
        ]
    },

    "1_STUDENTS": {
        "desc": "Thong tin bo sung cho sinh vien - trang thai, GVHD BCTT/KLTN",
        "columns": [
            ("email",             "Email SV (PK)",               35, "FK → USERS.email"),
            ("mssv",              "MSSV",                        12, "Ma so sinh vien"),
            ("status",            "Trang thai",                  22, "NEW | BCTT_REGISTERED | BCTT_SUBMITTED | BCTT_APPROVED | BCTT_REJECTED | KLTN_REGISTERED | COUNCIL_ASSIGNED | SUBMITTED | DEFENDED | COMPLETED"),
            ("bcttLecturer",      "GVHD BCTT",                   30, "Email GV huong dan BCTT, FK → LECTURERS.email"),
            ("kltnLecturer",      "GVHD KLTN",                   30, "Email GV huong dan KLTN, FK → LECTURERS.email"),
            ("internshipForm",    "Phieu XN Thuc tap",           40, "Link Google Drive Phieu Xac nhan Thuc tap"),
        ],
        "data": [
            ["sv01@univ.edu.vn",  "20520001", "BCTT_APPROVED",  "gv01@univ.edu.vn", "",        ""],
            ["sv02@univ.edu.vn",  "20520002", "KLTN_REGISTERED","gv02@univ.edu.vn","gv01@univ.edu.vn", ""],
            ["sv03@univ.edu.vn",  "20520003", "BCTT_REGISTERED","gv03@univ.edu.vn", "",        ""],
            ["sv04@univ.edu.vn",  "20520004", "NEW",            "",                "",         ""],
        ]
    },

    "2_LECTURERS": {
        "desc": "Thông tin giảng viên - quota, chuyên môn, lĩnh vực",
        "columns": [
            ("email",             "Email GV (PK)",               32, "FK → USERS.email"),
            ("quota",             "Quota (So SV toi da)",        20, "Số sinh viên tối đa được nhận HD"),
            ("currentSlot",       "So SV hien tai",              18, "Số sinh viên đã nhận HD (tự động trừ khi có BCTT)"),
            ("majors",            "Chuyen nganh",                 22, "CNTT,AI,Data | HTTT,ERP | AT,KTMT | Multiple, comma-separated"),
            ("expertise",         "Chuyen mon",                  35, "Machine Learning, Deep Learning | Business Intelligence..."),
        ],
        "data": [
            ["gv01@univ.edu.vn",  8,  2, "CNTT,AI,Data",           "Machine Learning, Deep Learning, Computer Vision, NLP"],
            ["gv02@univ.edu.vn",  6,  1, "HTTT,ERP,BI",           "Business Intelligence, ERP Systems, Data Warehouse"],
            ["gv03@univ.edu.vn",  10, 0, "CNTT,Cloud,Security",    "Cloud Computing, Cyber Security, Network Administration"],
            ["gv04@univ.edu.vn",  6,  0, "AT,KTMT,KHMT",           "Computer Architecture, Operating Systems, Algorithms"],
        ]
    },

    "3_TOPICS": {
        "desc": "Đề tài SV đăng ký (tự động tạo khi SV đăng ký KLTN)",
        "columns": [
            ("id",                "Topic ID (PK)",                18, "ID duy nhất, ví dụ: topic-abc123"),
            ("name",              "Ten de tai",                  45, "Tên đề tài đầy đủ"),
            ("field",             "Linh vuc",                    18, "CNTT | HTTT | AI | Data | Security | Cloud | AT | KHMT"),
            ("createdBy",         "SV tao (FK→USERS)",           30, "Email sinh viên tạo đề tài"),
            ("status",            "Trang thai",                  15, "ACTIVE | INACTIVE | ARCHIVED"),
            ("suggestedBy",       "GV goi y (FK→USERS)",         30, "Email GV đã gợi ý (nếu là đề tài được GV gợi ý)"),
        ],
        "data": [
            ["topic-sv01-bctt",   "Xây dựng Dashboard KPI doanh nghiệp",      "CNTT", "sv01@univ.edu.vn", "ACTIVE", ""],
            ["topic-sv02-bctt",   "Phân tích dữ liệu sinh viên trường ĐH",    "HTTT", "sv02@univ.edu.vn", "ACTIVE", ""],
            ["topic-sv03-bctt",   "Ứng dụng AI trong chẩn đoán bệnh da liễu","AI",   "sv03@univ.edu.vn", "ACTIVE", "gv01@univ.edu.vn"],
            ["topic-sv02-kltn",   "Hệ thống phân tích dữ liệu học tập SV",   "HTTT", "sv02@univ.edu.vn", "ACTIVE", ""],
            ["topic-gv01-01",     "Phát hiện gian lận thi cử trực tuyến AI",  "AI",   "sv04@univ.edu.vn", "ACTIVE", "gv01@univ.edu.vn"],
        ]
    },

    "4_REGISTRATIONS": {
        "desc": "Đăng ký BCTT/KLTN của sinh viên - flow: SV đăng ký → GV duyệt → cập nhật trạng thái",
        "columns": [
            ("id",                "Reg ID (PK)",                  18, "ID duy nhất, ví dụ: reg-abc123"),
            ("student",           "Email SV (FK→USERS)",          32, "Email sinh viên đăng ký"),
            ("type",              "Loai",                         12, "BCTT | KLTN"),
            ("topic",             "Topic ID (FK→TOPICS)",         22, "FK → TOPICS.id"),
            ("topicName",         "Ten de tai",                   40, "Tên đề tài (để dễ đọc, trùng với TOPICS.name)"),
            ("lecturer",          "GVHD (FK→LECTURERS)",          30, "Email GV hướng dẫn"),
            ("status",            "Trang thai",                   15, "PENDING | APPROVED | REJECTED"),
            ("dot",               "Dot (Hoc ky)",                12, "Ví dụ: 2026-1, 2026-2"),
            ("createdAt",         "Ngay dang ky",                 22, "Ngày SV đăng ký (ISO)"),
            ("approvedAt",        "Ngay duyet",                   22, "Ngày GV duyệt (ISO, rỗng nếu chưa duyệt)"),
            ("field",             "Linh vuc",                    18, "Lĩnh vực đăng ký (CNTT, HTTT...)"),
        ],
        "data": [
            ["reg-001", "sv01@univ.edu.vn", "BCTT", "topic-sv01-bctt", "Xây dựng Dashboard KPI doanh nghiệp",     "gv01@univ.edu.vn", "APPROVED", "2026-1", "2026-02-01", "2026-02-05", "CNTT"],
            ["reg-002", "sv02@univ.edu.vn", "BCTT", "topic-sv02-bctt", "Phân tích dữ liệu sinh viên trường ĐH",    "gv02@univ.edu.vn", "APPROVED", "2026-1", "2026-02-03", "2026-02-07", "HTTT"],
            ["reg-003", "sv02@univ.edu.vn", "KLTN", "topic-sv02-kltn", "Hệ thống phân tích dữ liệu học tập SV",   "gv01@univ.edu.vn", "APPROVED", "2026-1", "2026-03-01", "2026-03-05", "HTTT"],
            ["reg-004", "sv03@univ.edu.vn", "BCTT", "topic-sv03-bctt", "Ứng dụng AI trong chẩn đoán bệnh da liễu","gv03@univ.edu.vn", "PENDING",  "2026-1", "2026-03-05", "",          "AI"],
            ["reg-005", "sv01@univ.edu.vn", "KLTN", "topic-sv01-bctt", "Xây dựng Dashboard KPI doanh nghiệp",     "gv01@univ.edu.vn", "PENDING",  "2026-1", "2026-04-01", "",          "CNTT"],
        ]
    },

    "5_SUBMISSIONS": {
        "desc": "Bài nộp của sinh viên - BCTT, KLTN, Phieu TT, Chinh sua",
        "columns": [
            ("student",           "Email SV (PK1)",               32, "FK → USERS.email"),
            ("type",              "Loai (PK2)",                   18, "BCTT | KLTN | PHIEU_TT | KLTN_REVISION"),
            ("file",              "Link file bai",                45, "Link Google Drive file PDF"),
            ("turnitin",          "Ty le trung lap (%)",          18, "Tỷ lệ trùng lặp Turnitin (số, 0-100)"),
            ("score",             "Diem",                         12, "Điểm số (0-10, 1 chữ số thập phân)"),
            ("submittedAt",       "Ngay nop",                    22, "Ngày nộp bài (ISO)"),
            ("gvhdApproval",      "GVHD duyet",                  15, "YES | NO | PENDING (có upload KLTN chưa?)"),
            ("gvhdApprovalDate",  "Ngay GVHD duyet",             22, "Ngày GVHD xác nhận SV đã upload (ISO)"),
        ],
        "data": [
            ["sv01@univ.edu.vn",  "BCTT",          "https://drive.google.com/file/d/1BCTT_sv01/view", "12.5", "8.5", "2026-03-10", "YES",  "2026-03-12"],
            ["sv02@univ.edu.vn",  "BCTT",          "https://drive.google.com/file/d/1BCTT_sv02/view", "8.2",  "9.0", "2026-03-08", "YES",  "2026-03-10"],
            ["sv02@univ.edu.vn",  "KLTN",          "https://drive.google.com/file/d/1KLTN_sv02/view", "",     "",    "2026-05-15", "PENDING", ""],
            ["sv02@univ.edu.vn",  "PHIEU_TT",      "https://drive.google.com/file/d/1PHIEU_sv02/view", "",   "",     "2026-03-09", "",  ""],
            ["sv02@univ.edu.vn",  "KLTN_REVISION", "",                                              "",     "",    "",           "",     ""],
        ]
    },

    "6_INTERNSHIP_FORMS": {
        "desc": "Phiếu xác nhận thực tập của công ty (file đặc biệt tách riêng)",
        "columns": [
            ("student",           "Email SV (PK)",               32, "FK → USERS.email"),
            ("file",              "Link Phieu XN",               50, "Link Google Drive Phiếu Xác nhận Thực tập có đóng dấu công ty"),
            ("submittedAt",       "Ngay nop",                   22, "Ngày nộp phiếu (ISO)"),
            ("status",            "Trang thai",                  15, "PENDING | APPROVED | REJECTED"),
        ],
        "data": [
            ["sv01@univ.edu.vn",  "https://drive.google.com/file/d/1PHIEU1/view", "2026-03-09", "APPROVED"],
            ["sv02@univ.edu.vn",  "https://drive.google.com/file/d/1PHIEU2/view", "2026-03-09", "APPROVED"],
        ]
    },

    "7_COUNCILS": {
        "desc": "Phân công hội đồng bảo vệ cho từng sinh viên",
        "columns": [
            ("student",           "Email SV (PK)",               32, "FK → USERS.email"),
            ("gvhd",              "GVHD (FK→USERS)",              30, "Email GV hướng dẫn trong hội đồng"),
            ("gvpb",              "GVPB (FK→USERS)",              30, "Email GV phản biện"),
            ("chairman",          "Chu tich (FK→USERS)",         30, "Email Chủ tịch hội đồng"),
            ("secretary",         "Thu ky (FK→USERS)",           30, "Email Thư ký hội đồng"),
            ("date",              "Ngay bao ve",                 20, "Ngày giờ bảo vệ (YYYY-MM-DD HH:MM)"),
            ("location",          "Dia diem",                    22, "Phòng họp, ví dụ: P.201 - Toà A"),
            ("councilStatus",     "Trang thai BV",               18, "PENDING | DEFENDED | CANCELLED"),
            ("finalScore",        "Diem cuoi cung",              18, "Điểm trung bình cuối cùng (do Thư ký nhập)"),
            ("minutesUrl",        "Link bien ban hop HD",        52, "Link Google Docs/Drive biên bản họp hội đồng bảo vệ"),
        ],
        "data": [
            ["sv02@univ.edu.vn", "gv01@univ.edu.vn", "gv02@univ.edu.vn", "chutich@univ.edu.vn", "thuky@univ.edu.vn", "2026-07-10 08:00", "P.201 - Tòa A", "PENDING", "", "https://docs.google.com/document/d/example-bien-ban"],
        ]
    },

    "8_SCORES": {
        "desc": "Điểm chi tiết từng thành viên hội đồng - GVHD, GVPB, Chủ tịch, Thư ký...",
        "columns": [
            ("id",                "Score ID (PK)",                18, "ID duy nhất, ví dụ: sc-001"),
            ("student",           "Email SV (FK→USERS)",          32, "FK → USERS.email"),
            ("type",              "Loai bai",                     15, "BCTT | KLTN"),
            ("role",              "Vai tro cham",                 18, "GVHD | GVPB | CHUTICH | THUKY | THANKYVIEN"),
            ("score",             "Diem (tong)",               15, "Điểm tổng (BCTT 0-10, KLTN 0-12), 2 chữ số thập phân"),
            ("comment",           "Nhan xet / Cau hoi",           55, "Nhận xét hoặc câu hỏi (quan trọng cho GVPB)"),
            ("savedAt",           "Ngay cham",                    22, "Ngày lưu điểm (ISO)"),
            ("r1",                "TC1",                          12, "Điểm tiêu chí 1"),
            ("r2",                "TC2",                          12, "Điểm tiêu chí 2"),
            ("r3",                "TC3",                          12, "Điểm tiêu chí 3"),
            ("r4",                "TC4",                          12, "Điểm tiêu chí 4"),
            ("r5",                "TC5",                          12, "Điểm tiêu chí 5"),
            ("r6",                "TC6",                          12, "Điểm tiêu chí 6"),
            ("r7",                "TC7",                          12, "Điểm tiêu chí 7"),
            ("r8",                "TC8",                          12, "Điểm tiêu chí 8"),
            ("rubricTotal",       "Tong rubric",                15, "Tổng điểm theo rubric (trùng với 'score')"),
        ],
        "data": [
            ["sc-001", "sv01@univ.edu.vn", "BCTT", "GVHD",     8.5, '{"v":1,"rubric":[0.75,0.75,1.5,1.25,1.5,0.75,0.5,1.5],"total":8.5,"note":"Bài làm tốt, có ý nghĩa thực tiễn; cần bổ sung thêm tài liệu tham khảo."}', "2026-03-15", 0.75, 0.75, 1.5, 1.25, 1.5, 0.75, 0.5, 1.5, 8.5],
            ["sc-002", "sv02@univ.edu.vn", "BCTT", "GVHD",     9.0, '{"v":1,"rubric":[0.75,0.75,1.75,1.25,1.5,0.75,0.75,1.5],"total":9.0,"note":"Bài phân tích sâu sắc; phương pháp khoa học; kết quả đáng tin cậy."}', "2026-03-16", 0.75, 0.75, 1.75, 1.25, 1.5, 0.75, 0.75, 1.5, 9.0],
            ["sc-003", "sv02@univ.edu.vn", "KLTN", "GVHD",    8.5, '{"v":1,"rubric":[0.75,0.75,1.25,1.25,2.0,0.75,0.75,1.0],"total":8.5,"note":"Bài làm tốt, có yếu tố sáng tạo; cần hoàn thiện thêm phần thực nghiệm."}', "2026-06-20", 0.75, 0.75, 1.25, 1.25, 2.0, 0.75, 0.75, 1.0, 8.5],
            ["sc-004", "sv02@univ.edu.vn", "KLTN", "GVPB",    8.0, '{"v":1,"rubric":[0.75,0.75,1.0,1.25,1.5,0.75,0.75,1.25],"total":8.0,"note":"Phân tích khá toàn diện. Câu hỏi: (1) Làm thế nào để scale hệ thống? (2) Độ chính xác mô hình ML là bao nhiêu?"}', "2026-06-21", 0.75, 0.75, 1.0, 1.25, 1.5, 0.75, 0.75, 1.25, 8.0],
            ["sc-005", "sv02@univ.edu.vn", "KLTN", "CHUTICH", 8.5, '{"v":1,"rubric":[0.75,0.75,1.25,1.5,1.75,0.75,0.75,1.0],"total":8.5,"note":"Trình bày tốt; trả lời được câu hỏi phản biện."}', "2026-07-10", 0.75, 0.75, 1.25, 1.5, 1.75, 0.75, 0.75, 1.0, 8.5],
            ["sc-006", "sv02@univ.edu.vn", "KLTN", "THUKY",   8.5, '{"v":1,"rubric":[0.75,0.75,1.25,1.25,2.0,0.75,0.75,1.0],"total":8.5,"note":"Điểm cộng cho bài có khả năng ứng dụng thực tế."}', "2026-07-10", 0.75, 0.75, 1.25, 1.25, 2.0, 0.75, 0.75, 1.0, 8.5],
        ]
    },

    "9_REVISIONS": {
        "desc": "Bài chỉnh sửa sau bảo vệ - SV nộp → GVHD duyệt → Chủ tịch duyệt → Hoàn thành",
        "columns": [
            ("id",                "Revision ID (PK)",            18, "ID duy nhất, ví dụ: rev-001"),
            ("student",           "Email SV (PK)",               32, "FK → USERS.email"),
            ("kltnFile",          "Link bai chinh sua",           50, "Link Google Drive file PDF bài đã chỉnh sửa"),
            ("revisionNote",      "Bien ban giai trinh",         50, "Link Google Drive Biên bản giải trình các thay đổi"),
            ("submittedAt",       "Ngay nop",                    22, "Ngày SV nộp bài chỉnh sửa (ISO)"),
            ("gvhdApproval",      "GVHD dong y",                 15, "YES | NO | PENDING"),
            ("gvhdApprovalDate",  "Ngay GVHD duyet",             22, "Ngày GVHD duyệt (ISO)"),
            ("chairmanApproval",  "Chu tich dong y",            18, "YES | NO | PENDING"),
            ("chairmanApprovalDate","Ngay CT duyet",             22, "Ngày Chủ tịch duyệt (ISO)"),
            ("finalStatus",       "Trang thai cuoi",             18, "PENDING | APPROVED | REJECTED | COMPLETED"),
        ],
        "data": [
            ["rev-001", "sv02@univ.edu.vn", "https://drive.google.com/file/d/1REV1/view", "https://drive.google.com/file/d/1BB1/view", "2026-07-12", "YES", "2026-07-13", "PENDING", "", "PENDING"],
        ]
    },

    "10_TOPIC_SUGGESTIONS": {
        "desc": "Đề tài được GV gợi ý - SV xem và chọn đăng ký",
        "columns": [
            ("id",                "Sug ID (PK)",                  18, "ID duy nhất, ví dụ: sug-001"),
            ("lecturer",          "GV goi y (FK→USERS)",         30, "Email GV đề xuất đề tài"),
            ("name",              "Ten de tai",                   45, "Tên đề tài gợi ý"),
            ("field",             "Linh vuc",                    18, "CNTT | HTTT | AI | Data | Security | Cloud"),
            ("description",       "Mo ta chi tiet",              60, "Mô tả chi tiết nội dung, yêu cầu, công nghệ sử dụng"),
            ("status",            "Trang thai",                  15, "PENDING | APPROVED | REJECTED"),
            ("createdAt",         "Ngay tao",                    22, "Ngày GV tạo gợi ý (ISO)"),
        ],
        "data": [
            ["sug-001", "gv01@univ.edu.vn", "Hệ thống nhận diện gian lận thi cử trực tuyến sử dụng AI",       "AI",     "Xây dựng hệ thống phát hiện gian lận trong các kỳ thi trực tuyến dựa trên hành vi người dùng và kỹ thuật học sâu. Yêu cầu: Python, TensorFlow/PyTorch, dataset tự collect.", "APPROVED", "2026-01-20"],
            ["sug-002", "gv02@univ.edu.vn", "Ứng dụng Blockchain trong quản lý chuỗi cung ứng",               "HTTT",   "Nghiên cứu và triển khai ứng dụng blockchain để tăng cường minh bạch trong chuỗi cung ứng. Yêu cầu: Solidity, Web3.js, Hyperledger.", "APPROVED", "2026-01-21"],
            ["sug-003", "gv03@univ.edu.vn", "Bảo mật ứng dụng IoT trong nhà thông minh",                       "Security","Phân tích các lỗ hổng bảo mật trong hệ thống IoT và đề xuất giải pháp bảo mật cho nhà thông minh. Yêu cầu: Python, MQTT, encryption.", "APPROVED", "2026-01-22"],
            ["sug-004", "gv01@univ.edu.vn", "Dashboard phân tích dữ liệu sinh viên cho trường ĐH",             "Data",   "Xây dựng dashboard trực quan hóa dữ liệu học tập của sinh viên. Yêu cầu: React, D3.js, Python, Flask.", "PENDING",  "2026-02-01"],
            ["sug-005", "gv04@univ.edu.vn", "Tối ưu hóa thuật toán sắp xếp trên dữ liệu lớn",               "KHMT",   "Nghiên cứu và cải tiến thuật toán sắp xếp cho Big Data. Yêu cầu: C++/Java, Hadoop, MapReduce.", "REJECTED", "2026-02-05"],
        ]
    },

    "11_PERIODS": {
        "desc": "Học kỳ / đợt đăng ký - đặt deadline cho BCTT, KLTN, chỉnh sửa",
        "columns": [
            ("id",                "Period ID (PK)",               18, "ID duy nhất, ví dụ: p-2026-1"),
            ("name",              "Ten hoc ky",                  22, "Tên học kỳ, ví dụ: Hoc ky 2026-1"),
            ("bcttDeadline",      "Han nop BCTT",                22, "Deadline nộp BCTT (YYYY-MM-DD)"),
            ("kltnDeadline",      "Han nop KLTN",                22, "Deadline nộp KLTN (YYYY-MM-DD)"),
            ("revisionDeadline",  "Han chinh sua BV",            22, "Deadline nộp bài chỉnh sửa sau bảo vệ (YYYY-MM-DD)"),
            ("status",            "Trang thai",                  15, "ACTIVE | INACTIVE | COMPLETED"),
        ],
        "data": [
            ["p-2026-1",  "Học kỳ 2026-1",  "2026-04-15", "2026-06-30", "2026-07-15", "ACTIVE"],
            ["p-2025-2",  "Học kỳ 2025-2",  "2025-11-15", "2026-01-30", "2026-02-15", "INACTIVE"],
        ]
    },

    "12_AUDIT_LOGS": {
        "desc": "Nhật ký hành động - ghi log tất cả thao tác trên hệ thống (tự động ghi)",
        "columns": [
            ("ts",                "Timestamp",                   22, "Thời điểm thao tác (ISO)"),
            ("role",              "Vai tro",                     15, "Vai trò người thực hiện"),
            ("actor",             "Email nguoi thuc hien",      32, "Email người thực hiện"),
            ("action",            "Hanh dong",                   25, "LOGIN | REGISTER | CREATE_REGISTRATION | SAVE_SCORE | APPROVE | REJECT | UPLOAD..."),
            ("target",            "Doi tuong tac dong",         30, "Email SV / ID đăng ký / ID đề tài..."),
            ("detail",            "Chi tiet",                   55, "Mô tả chi tiết hành động"),
        ],
        "data": [
            ["2026-01-10T08:00:00Z", "ADMIN",  "admin@univ.edu.vn", "REGISTER",        "sv01@univ.edu.vn", "SV sv01 dang ky tai khoan"],
            ["2026-01-10T08:05:00Z", "ADMIN",  "admin@univ.edu.vn", "APPROVE_USER",    "sv01@univ.edu.vn", "Admin duyet tai khoan sv01"],
            ["2026-02-01T10:00:00Z", "SV",     "sv01@univ.edu.vn",  "CREATE_REGISTRATION","reg-001",       "SV dang ky BCTT topic-01"],
            ["2026-02-05T14:00:00Z", "GV",     "gv01@univ.edu.vn",  "APPROVE_REGISTRATION","reg-001",       "GV duyet dang ky BCTT sv01"],
            ["2026-03-01T09:00:00Z", "SV",     "sv02@univ.edu.vn",  "CREATE_REGISTRATION","reg-002",       "SV dang ky BCTT topic-02"],
            ["2026-03-07T11:00:00Z", "GV",     "gv02@univ.edu.vn",  "APPROVE_REGISTRATION","reg-002",       "GV duyet dang ky BCTT sv02"],
        ]
    },
}


# =====================================================================
# RELATIONSHIP MAP (for reference sheet)
# =====================================================================

RELATIONSHIPS = [
    ("USERS",         "email",    "STUDENTS",         "email",    "1:1", "SV có thêm thông tin trong STUDENTS"),
    ("USERS",         "email",    "LECTURERS",         "email",    "1:1", "GV có thêm quota trong LECTURERS"),
    ("REGISTRATIONS", "student",  "USERS",             "email",    "N:1", "Nhiều đăng ký của 1 SV"),
    ("REGISTRATIONS", "topic",    "TOPICS",            "id",       "N:1", "Đăng ký tham chiếu đến TOPIC"),
    ("REGISTRATIONS", "lecturer", "LECTURERS",         "email",    "N:1", "Đăng ký có 1 GVHD"),
    ("SUBMISSIONS",   "student",  "USERS",             "email",    "N:1", "SV có nhiều bài nộp (BCTT/KLTN...)"),
    ("COUNCILS",      "student",  "USERS",             "email",    "1:1", "Mỗi SV có 1 hội đồng"),
    ("COUNCILS",      "gvhd",     "LECTURERS",         "email",    "1:1", "Hội đồng có GVHD"),
    ("COUNCILS",      "gvpb",     "LECTURERS",         "email",    "1:1", "Hội đồng có GVPB"),
    ("COUNCILS",      "chairman", "LECTURERS",         "email",    "1:1", "Hội đồng có Chủ tịch"),
    ("COUNCILS",      "secretary","LECTURERS",         "email",    "1:1", "Hội đồng có Thư ký"),
    ("SCORES",        "student",  "USERS",             "email",    "N:1", "Mỗi SV có nhiều điểm từ nhiều vai trò"),
    ("REVISIONS",     "student",  "USERS",             "email",    "1:1", "Mỗi SV có 1 bản chỉnh sửa"),
    ("TOPIC_SUGGESTIONS","lecturer","LECTURERS",       "email",    "N:1", "GV có nhiều gợi ý đề tài"),
    ("PERIODS",       "id",       "REGISTRATIONS",     "dot",      "1:N", "1 đợt có nhiều đăng ký"),
    ("AUDIT_LOGS",    "actor",    "USERS",             "email",    "N:1", "Log ghi nhận hành động của user"),
]

WORKFLOW_STEPS = [
    ("1", "SV đăng ký tài khoản",            "USERS.status=PENDING",          "Tự động",   "Admin duyệt → USERS.status=APPROVED"),
    ("2", "TBM mở quota GV",                  "LECTURERS.quota, LECTURERS.currentSlot","TBM",  "TBM cập nhật quota cho từng GV"),
    ("3", "SV đăng ký BCTT",                 "STUDENTS.status=BCTT_REGISTERED","SV",   "Chọn đề tài, GVHD → REGISTRATIONS.status=PENDING"),
    ("4", "GV duyệt BCTT (hàng loạt)",        "REGISTRATIONS.status=APPROVED","GV",   "approveRegistrationsBulk → STUDENTS.status=BCTT_APPROVED"),
    ("5", "SV nộp BCTT + Phieu XN",           "SUBMISSIONS.type=BCTT, INTERNSHIP_FORMS","SV","Upload PDF lên Google Drive → lưu link"),
    ("6", "GV chấm điểm BCTT",               "SCORES.type=BCTT, SCORES.role=GVHD","GV", "Nhập điểm, nhận xét → STUDENTS.status=BCTT_APPROVED/REJECTED"),
    ("7", "SV đăng ký KLTN (sau BCTT đạt)",  "STUDENTS.status=KLTN_REGISTERED","SV", "Kiểm tra BCTT_APPROVED → REGISTRATIONS.type=KLTN"),
    ("8", "TBM phân công phản biện",          "COUNCILS.gvpb",                 "TBM",   "Assign reviewer cho SV đã đăng ký KLTN"),
    ("9", "TBM phân công hội đồng",          "COUNCILS (day du thanh vien)",   "TBM",   "GVHD, GVPB, Chủ tịch, Thư ký"),
    ("10","SV nộp KLTN",                      "SUBMISSIONS.type=KLTN",         "SV",   "Upload PDF bài KLTN trước deadline"),
    ("11","GV upload Turnitin + chấm điểm",   "SUBMISSIONS.turnitin, SCORES",  "GV",   "Nhập tỷ lệ trùng lặp, điểm, nhận xét"),
    ("12","Họp hội đồng bảo vệ",             "COUNCILS.date, COUNCILS.location","THUKY","Thư ký điều phối, ghi biên bản"),
    ("13","Thư ký nhập điểm cuối cùng",       "COUNCILS.finalScore",           "THUKY", "Xem tất cả điểm → nhập điểm TB"),
    ("14","SV nộp bài chỉnh sửa sau BV",     "REVISIONS",                     "SV",   "Upload bài đã chỉnh sửa + biên bản giải trình"),
    ("15","GVHD duyệt chỉnh sửa",            "REVISIONS.gvhdApproval=YES",    "GVHD", "Kiểm tra file, biên bản → duyệt/từ chối"),
    ("16","Chủ tịch duyệt chỉnh sửa",        "REVISIONS.chairmanApproval=YES","CHUTICH","Chỉ duyệt SAU khi GVHD đã duyệt → COMPLETED"),
]

# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

def set_col_width(ws, col_letter, width):
    ws.column_dimensions[col_letter].width = width

def style_header_row(ws, row_num, num_cols, bg=C["header_bg"], fg=C["header_fg"]):
    for c in range(1, num_cols + 1):
        cell = ws.cell(row=row_num, column=c)
        cell.fill = make_fill(bg)
        cell.font = make_font(bold=True, color=fg, size=10)
        cell.alignment = make_align(h="center", v="center")
        cell.border = make_border()

def style_data_row(ws, row_num, num_cols, alt=False):
    bg = C["alt_row"] if alt else C["white"]
    for c in range(1, num_cols + 1):
        cell = ws.cell(row=row_num, column=c)
        if cell.fill.fgColor.rgb not in (C["success_bg"], C["warning_bg"], C["danger_bg"], C["purple_bg"], C["teal_bg"], C["header_bg"]):
            cell.fill = make_fill(bg)
        cell.font = make_font(size=9.5)
        cell.alignment = make_align(v="center", wrap=True)
        cell.border = make_border()

def add_validation_dropdown(ws, col_letter, formula1, rows="100"):
    dv = DataValidation(type="list", formula1=formula1, allow_blank=True, showDropDown=False)
    dv.sqref = f"{col_letter}2:{col_letter}{rows}"
    dv.prompt = "Chọn giá trị từ danh sách"
    dv.promptTitle = "Validation"
    ws.add_data_validation(dv)

def color_status_cell(cell, status):
    """Color status cells based on their value"""
    s = str(status or "").upper()
    if s == "APPROVED" or s == "YES" or s == "ACTIVE" or s == "COMPLETED" or s == "PASSED" or s == "DEFENDED":
        cell.fill = make_fill(alpha_hex(C["success_bg"], 0.15))
        cell.font = make_font(bold=True, color=C["success_bg"])
    elif s == "REJECTED" or s == "NO" or s == "INACTIVE" or s == "FAILED":
        cell.fill = make_fill(alpha_hex(C["danger_bg"], 0.15))
        cell.font = make_font(bold=True, color=C["danger_bg"])
    elif s == "PENDING" or s == "NEW":
        cell.fill = make_fill(alpha_hex(C["warning_bg"], 0.15))
        cell.font = make_font(bold=True, color=C["warning_bg"])
    else:
        cell.fill = make_fill(C["white"])
        cell.font = make_font()

def alpha_hex(hex_color, alpha_val):
    """Convert hex + alpha to RGBA string for openpyxl"""
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    a = int(alpha_val * 255)
    return f"{a:02X}{r:02X}{g:02X}{b:02X}"

def freeze_top_row(ws):
    ws.freeze_panes = "A2"

def add_sheet_title(ws, title, subtitle, num_cols):
    """Add a big title banner at top of sheet"""
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=num_cols)
    title_cell = ws.cell(row=1, column=1, value=title)
    title_cell.fill = make_fill(C["header_bg"])
    title_cell.font = Font(name="Calibri", bold=True, size=16, color=C["header_fg"])
    title_cell.alignment = make_align(h="center", v="center")
    title_cell.border = make_border()
    ws.row_dimensions[1].height = 35

    if subtitle:
        ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=num_cols)
        sub_cell = ws.cell(row=2, column=1, value=subtitle)
        sub_cell.fill = make_fill(C["sub_header_bg"])
        sub_cell.font = Font(name="Calibri", size=9, color=C["sub_header_fg"], italic=True)
        sub_cell.alignment = make_align(h="center", v="center")
        sub_cell.border = make_border()
        ws.row_dimensions[2].height = 20
        return 3  # data starts at row 3
    return 2  # data starts at row 2


# =====================================================================
# MAIN SHEET CREATION
# =====================================================================

def create_data_sheet(wb, name, cfg):
    ws = wb.create_sheet(title=name)

    col_names = [col[0] for col in cfg["columns"]]
    col_widths = [col[2] for col in cfg["columns"]]
    col_descs  = [col[3] for col in cfg["columns"]]
    num_cols = len(col_names)
    num_data_rows = len(cfg["data"])

    # Title + header
    data_start = add_sheet_title(ws, name.replace("0_", "").replace("_", " "), cfg["desc"], num_cols)

    # Description row (light)
    for i, desc in enumerate(col_descs):
        cell = ws.cell(row=data_start, column=i+1, value=desc)
        cell.fill = make_fill("EFF6FF")
        cell.font = make_font(size=8, italic=True, color=C["text_muted"])
        cell.alignment = make_align(h="left", v="center", wrap=True)
        cell.border = make_border()
    ws.row_dimensions[data_start].height = 28

    # Column headers
    style_header_row(ws, data_start + 1, num_cols)
    for i, col_name in enumerate(col_names):
        ws.cell(row=data_start + 1, column=i+1, value=col_name)
    ws.row_dimensions[data_start + 1].height = 22

    # Data rows
    for ri, row_data in enumerate(cfg["data"]):
        excel_row = data_start + 2 + ri
        alt = (ri % 2 == 1)
        for ci, val in enumerate(row_data):
            cell = ws.cell(row=excel_row, column=ci+1, value=val)
            # Auto-color status columns
            col_key = col_names[ci]
            if col_key == "status" or col_key == "role" or col_key == "councilStatus" or col_key == "finalStatus":
                color_status_cell(cell, val)
            elif col_key == "gvhdApproval" or col_key == "chairmanApproval":
                color_status_cell(cell, val)
        style_data_row(ws, excel_row, num_cols, alt)

    # Column widths
    for i, w in enumerate(col_widths):
        set_col_width(ws, get_column_letter(i+1), w)

    # Freeze
    ws.freeze_panes = ws.cell(row=data_start + 2, column=1)

    # Auto-filter
    ws.auto_filter.ref = ws.dimensions

    # Data validations
    role_col_idx = col_names.index("role") + 1 if "role" in col_names else None
    if role_col_idx:
        dv = DataValidation(type="list", formula1='"SV,GV,TBM,THUKY,CHUTICH,ADMIN"', allow_blank=True, showDropDown=False)
        dv.sqref = f"{get_column_letter(role_col_idx)}3:{get_column_letter(role_col_idx)}{data_start + 2 + num_data_rows}"
        ws.add_data_validation(dv)

    status_col_idx = col_names.index("status") + 1 if "status" in col_names else None
    if status_col_idx:
        dv = DataValidation(type="list", formula1='"PENDING,APPROVED,REJECTED,INACTIVE"', allow_blank=True, showDropDown=False)
        dv.sqref = f"{get_column_letter(status_col_idx)}3:{get_column_letter(status_col_idx)}{data_start + 2 + num_data_rows}"
        ws.add_data_validation(dv)

    return ws


def create_relationship_sheet(wb):
    ws = wb.create_sheet(title="Z_RELATIONS", index=99)
    num_cols = 5
    data_start = add_sheet_title(ws, "SƠ ĐỒ QUAN HỆ DATABASE", "Mối quan hệ giữa các bảng trong hệ thống KLTN Portal", num_cols)

    headers = ["Bảng cha", "Cột FK", "Bảng con", "Cột PK/FK", "Quan hệ", "Mô tả"]
    style_header_row(ws, data_start, len(headers))
    for i, h in enumerate(headers):
        ws.cell(row=data_start, column=i+1, value=h)
    ws.row_dimensions[data_start].height = 22

    colors_rel = [C["header_bg"], C["sub_header_bg"], C["success_bg"], C["purple_bg"], C["teal_bg"], C["warning_bg"]]
    for ri, rel in enumerate(RELATIONSHIPS):
        row = data_start + 1 + ri
        alt = (ri % 2 == 1)
        bg = C["alt_row"] if alt else C["white"]
        for ci, val in enumerate(rel):
            cell = ws.cell(row=row, column=ci+1, value=val)
            cell.fill = make_fill(bg)
            cell.font = make_font(size=9.5)
            cell.alignment = make_align(v="center", wrap=True)
            cell.border = make_border()
        set_col_width(ws, get_column_letter(1), 25)
        set_col_width(ws, get_column_letter(2), 20)
        set_col_width(ws, get_column_letter(3), 25)
        set_col_width(ws, get_column_letter(4), 20)
        set_col_width(ws, get_column_letter(5), 12)
        set_col_width(ws, get_column_letter(6), 45)
    ws.freeze_panes = ws.cell(row=data_start + 1, column=1)


def create_workflow_sheet(wb):
    ws = wb.create_sheet(title="Z_WORKFLOW", index=98)
    num_cols = 5
    data_start = add_sheet_title(ws, "WORKFLOW HỆ THỐNG KLTN", "Quy trình hoàn chỉnh từ đăng ký → bảo vệ → hoàn thành", num_cols)

    headers = ["Bước", "Tên bước", "Cột/Sheet liên quan", "Vai trò thực hiện", "Mô tả chi tiết"]
    style_header_row(ws, data_start, len(headers))
    for i, h in enumerate(headers):
        ws.cell(row=data_start, column=i+1, value=h)
    ws.row_dimensions[data_start].height = 22

    workflow_colors = [
        C["purple_bg"], C["teal_bg"], C["success_bg"], C["sub_header_bg"],
        C["warning_bg"], C["danger_bg"], C["header_bg"], C["purple_bg"],
        C["teal_bg"], C["success_bg"], C["sub_header_bg"], C["warning_bg"],
        C["danger_bg"], C["purple_bg"], C["teal_bg"], C["success_bg"]
    ]

    for ri, step in enumerate(WORKFLOW_STEPS):
        row = data_start + 1 + ri
        alt = (ri % 2 == 1)
        bg = C["alt_row"] if alt else C["white"]
        for ci, val in enumerate(step):
            cell = ws.cell(row=row, column=ci+1, value=val)
            if ci == 0:
                cell.fill = make_fill(alpha_hex(workflow_colors[ri % len(workflow_colors)], 0.2))
                cell.font = make_font(bold=True, size=10)
            elif ci == 1:
                cell.font = make_font(bold=True, size=9.5)
            else:
                cell.fill = make_fill(bg)
                cell.font = make_font(size=9)
            cell.alignment = make_align(v="center", wrap=True)
            cell.border = make_border()
        ws.row_dimensions[row].height = 30

    set_col_width(ws, "A", 8)
    set_col_width(ws, "B", 32)
    set_col_width(ws, "C", 38)
    set_col_width(ws, "D", 18)
    set_col_width(ws, "E", 50)
    ws.freeze_panes = ws.cell(row=data_start + 1, column=1)


def create_instruction_sheet(wb):
    ws = wb.create_sheet(title="Z_HDSD", index=0)
    num_cols = 3
    add_sheet_title(ws, "HƯỚNG DẪN SỬ DỤNG TEMPLATE DATABASE KLTN PORTAL",
                    "File template này chứa đầy đủ cấu trúc database cho hệ thống quản lý KLTN. "
                    "Đọc kỹ hướng dẫn trước khi nhập dữ liệu.", num_cols)

    instructions = [
        ("[PURPOSE] MUC DICH", "File Excel nay la template database hoan chinh cho he thong KLTN Portal. "
         "Moi sheet = 1 bang trong Google Sheets backend. "
         "Copy toan bo data tu cac sheet nay vao Google Sheets tuong ung."),
        ("[HOW TO USE] CACH SU DUNG", "1. Mo Google Sheets (tao moi hoac dung sheet co san)\n"
         "2. Tao cac sheet theo ten: USERS, STUDENTS, LECTURERS, TOPICS, REGISTRATIONS, SUBMISSIONS, INTERNSHIP_FORMS, COUNCILS, SCORES, REVISIONS, TOPIC_SUGGESTIONS, PERIODS, AUDIT_LOGS\n"
         "3. Copy HEADER ROW (dong 1) tu moi sheet trong file Excel nay\n"
         "4. Copy SAMPLE DATA tu moi sheet trong file Excel nay\n"
         "5. Paste vao Google Sheets tuong ung\n"
         "6. Cap nhat CONFIG.SPREADSHEET_ID trong Code.gs thanh ID cua Google Sheets cua ban"),
        ("[GOOGLE SHEETS] DONG BO CAU TRUC VOI CODE.GS", "Neu file Google Sheet da co nhieu dong mo ta (template KLTN_Database_Template): mo Apps Script gan voi file do, chay ham runEnsureSourceTemplateSync() (hoac doPost action=ensureSheetStructure + adminKey + tuy chon spreadsheetId). "
         "Ham se: tao sheet thieu theo CONFIG.SHEETS; TIM HANG HEADER trong 15 dong dau (can it nhat 2 ten cot trung voi CONFIG); THEM COT THIEU o cuoi (vd. minutesUrl tren COUNCILS) — KHONG XOA du lieu. "
         "Sau khi them cot, dien link bien ban hop HD vao cot minutesUrl neu can."),
        ("[SHEET ORDER] THU TU TAO SHEETS (QUAN TRONG!)", "Thu tu tao sheet can tuan theo de khong vi pham rang buoc FK:\n"
         "1. USERS (bang goc - tat ca email reference tu day)\n"
         "2. STUDENTS (FK: email → USERS)\n"
         "3. LECTURERS (FK: email → USERS)\n"
         "4. TOPICS (FK: createdBy → USERS)\n"
         "5. REGISTRATIONS (FK: student→USERS, topic→TOPICS, lecturer→LECTURERS)\n"
         "6. SUBMISSIONS (FK: student → USERS)\n"
         "7. INTERNSHIP_FORMS (FK: student → USERS)\n"
         "8. COUNCILS (FK: student→USERS, gvhd/gvpb/chairman/secretary → USERS/LECTURERS)\n"
         "9. SCORES (FK: student → USERS)\n"
         "10. REVISIONS (FK: student → USERS)\n"
         "11. TOPIC_SUGGESTIONS (FK: lecturer → USERS/LECTURERS)\n"
         "12. PERIODS (standalone, FK den REGISTRATIONS qua dot)\n"
         "13. AUDIT_LOGS (standalone log, FK: actor → USERS)"),
        ("[ROLES] VAI TRO HE THONG", "SV (Sinh vien): Dang ky BCTT/KLTN, nop bai, xem diem\n"
         "GV (Giang vien): Huong dan, phan bien, cham diem\n"
         "TBM (Truong Bo Mon): Quan ly quota GV, phan cong hoi dong\n"
         "THUKY (Thu ky): Dieu phoi hoi dong, nhap diem cuoi cung\n"
         "CHUTICH (Chu tich HD): Duyet chinh sua sau bao ve\n"
         "ADMIN: Quan ly tai khoan, cau hinh he thong"),
        ("[REGISTRATION FLOW] QUY TRINH DANG KY BCTT → KLTN", "1. SV dang ky tai khoan (USERS.status=PENDING)\n"
         "2. ADMIN duyet tai khoan (USERS.status=APPROVED)\n"
         "3. TBM mo quota cho GV (LECTURERS.quota)\n"
         "4. SV dang ky BCTT → STUDENTS.status=BCTT_REGISTERED\n"
         "5. GV duyet hang loat → STUDENTS.status=BCTT_APPROVED\n"
         "6. SV nop BCTT + Phieu Xac nhan TT (SUBMISSIONS, INTERNSHIP_FORMS)\n"
         "7. GV cham diem BCTT → SCORES\n"
         "8. SV dang ky KLTN (chi khi BCTT_APPROVED)\n"
         "9. TBM phan cong hoi dong (COUNCILS)\n"
         "10. SV nop KLTN (SUBMISSIONS.type=KLTN)\n"
         "11. GV cham diem, upload Turnitin (SCORES, SUBMISSIONS.turnitin)\n"
         "12. Bao ve → Thu ky nhap diem cuoi cung (COUNCILS.finalScore)\n"
         "13. SV nop bai chinh sua (REVISIONS)\n"
         "14. GVHD duyet → CHUTICH duyet → COMPLETED"),
        ("[SUBMISSION TYPES] CAC LOAI BAI NOP", "BCTT: Bao cao thuc tap (file PDF, sinh vien nop)\n"
         "KLTN: Luan van tot nghiep (file PDF, sinh vien nop)\n"
         "PHIEU_TT: Phieu xac nhan thuc tap (file PDF dong dau cong ty)\n"
         "KLTN_REVISION: Bai KLTN da chinh sua sau bao ve"),
        ("[SCORE ROLES] CAC VAI TRO CHAM DIEM", "GVHD: Diem huong dan (thang 0-10)\n"
         "GVPB: Diem phan bien (thang 0-10, co nhan xet/cau hoi)\n"
         "CHUTICH: Diem chu tich hoi dong\n"
         "THUKY: Diem thu ky\n"
         "THANKYVIEN: Diem thanh vien khac"),
        ("[REVISION FLOW] QUY TRINH DUYET CHINH SUA", "SV nop bai chinh sua → REVISIONS.submittedAt\n"
         "GVHD xem va duyet → REVISIONS.gvhdApproval=YES/NO\n"
         "CHUTICH xem va duyet (CHI SAU khi GVHD da duyet) → REVISIONS.chairmanApproval=YES/NO\n"
         "Ca hai YES → REVISIONS.finalStatus=COMPLETED"),
        ("[PERIODS] QUAN LY HOC KY", "Moi hoc ky tao 1 dong trong PERIODS\n"
         "PERIODS.id dung lam REGISTRATIONS.dot de phan biet dot\n"
         "Chi PERIODS co status=ACTIVE moi hien thi tren frontend"),
        ("[SECURITY] BAO MAT", "Khong thay doi cau truc cot (thu tu, ten)\n"
         "Khong xoa dong header\n"
         "Email phai UNIQUE trong USERS\n"
         "MSSV phai UNIQUE trong USERS (cho SV)\n"
         "Password luu plain text (BE se hash khi dung)"),
    ]

    row = 3
    for title, content in instructions:
        # Title row
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=3)
        tc = ws.cell(row=row, column=1, value=title)
        tc.fill = make_fill(C["sub_header_bg"])
        tc.font = make_font(bold=True, color=C["white"], size=10)
        tc.alignment = make_align(h="left", v="center")
        tc.border = make_border()
        ws.row_dimensions[row].height = 26
        row += 1

        # Content row
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=3)
        cc = ws.cell(row=row, column=1, value=content)
        cc.fill = make_fill(C["light_bg"])
        cc.font = make_font(size=9.5)
        cc.alignment = make_align(h="left", v="top", wrap=True)
        cc.border = make_border()
        ws.row_dimensions[row].height = max(55, content.count("\n") * 15 + 20)
        row += 1
        row += 1  # spacer

    set_col_width(ws, "A", 30)
    set_col_width(ws, "B", 100)
    set_col_width(ws, "C", 10)


# =====================================================================
# MAIN
# =====================================================================

def main():
    print("Creating KLTN Portal Database Template...")
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    for sheet_key, cfg in SHEETS.items():
        name = sheet_key.split("_", 1)[1]
        print(f"  Creating sheet: {name}")
        create_data_sheet(wb, name, cfg)
    print("  Creating sheet: Z_HDSD (Instructions)")
    create_instruction_sheet(wb)
    print("  Creating sheet: Z_WORKFLOW")
    create_workflow_sheet(wb)
    print("  Creating sheet: Z_RELATIONS")
    create_relationship_sheet(wb)
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "KLTN_Database_Template.xlsx")
    wb.save(output_path)
    print(f"\nDone! Template created successfully!")
    print(f"File: {output_path}")
    print(f"Total: {len(SHEETS)} data sheets + 3 reference sheets")
    for i, sheet in enumerate(wb.sheetnames):
        print(f"  {i+1}. {sheet}")
    return output_path


if __name__ == "__main__":
    main()
