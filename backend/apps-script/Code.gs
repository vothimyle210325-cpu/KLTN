// Google Sheet chinh (USERS, STUDENTS, ...): mo sheet -> URL co dang
// https://docs.google.com/spreadsheets/d/<DAY_LA_SPREADSHEET_ID>/edit
// Dien ID vao duoi, luu Code.gs, Deploy lai Web App neu can.
const CONFIG = {
  SPREADSHEET_ID: "1k4W3AZDsKlu0h5XIx9-70tfd2-l0FGgxE7zxfKanLGY",
  SOURCE_DATA_SPREADSHEET_ID: "1k4W3AZDsKlu0h5XIx9-70tfd2-l0FGgxE7zxfKanLGY",
  ADMIN_REGISTER_KEY: "KLTN_ADMIN_2026",
  SHEETS: {
    USERS: ["email", "password", "name", "role", "major", "trainingSystem", "phone", "mssv", "status", "createdAt"],
    STUDENTS: ["email", "mssv", "status", "bcttLecturer", "kltnLecturer", "internshipForm"],
    LECTURERS: ["email", "quota", "currentSlot", "majors", "expertise"],
    TOPICS: ["id", "name", "field", "createdBy", "status", "suggestedBy"],
    REGISTRATIONS: ["id", "student", "type", "topic", "topicName", "lecturer", "status", "dot", "createdAt", "approvedAt"],
    SUBMISSIONS: ["student", "type", "file", "turnitin", "score", "submittedAt", "gvhdApproval", "gvhdApprovalDate"],
    INTERNSHIP_FORMS: ["student", "file", "submittedAt", "status"],
    COUNCILS: ["student", "gvhd", "gvpb", "chairman", "secretary", "date", "location", "councilStatus", "finalScore", "minutesUrl"],
    // SCORES: rubric o r1–r8 + rubricTotal + cot score; cot comment chi nhan xet chu (khong JSON)
    SCORES: ["id", "student", "type", "role", "score", "comment", "savedAt", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "rubricTotal"],
    REVISIONS: ["id", "student", "kltnFile", "revisionNote", "submittedAt", "gvhdApproval", "gvhdApprovalDate", "chairmanApproval", "chairmanApprovalDate", "finalStatus"],
    TOPIC_SUGGESTIONS: ["id", "lecturer", "name", "field", "description", "status", "createdAt"],
    PERIODS: ["id", "name", "bcttDeadline", "kltnDeadline", "revisionDeadline", "status"],
    AUDIT_LOGS: ["ts", "role", "actor", "action", "target", "detail"]
  }
};

function spreadsheetConfigured() {
  var id = CONFIG.SPREADSHEET_ID || "";
  return id.length > 0 && id.indexOf("REPLACE") !== 0;
}

function doGet(e) {
  return json({ ok: true, message: "KLTN API is running", query: e.parameter || {} });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;
    if (!action) return json({ ok: false, message: "Missing action" });

    if (action === "login") return json(login(body));
    if (action === "register") return json(registerUser(body));
    if (action === "debugLogin") {
      if (!spreadsheetConfigured()) return json({ ok: false });
      var users = readObjects("USERS");
      var email = String(body.email || "").trim().toLowerCase();
      var password = String(body.password || "").trim();
      var user = users.find(function (u) { return String(u.email || "").toLowerCase() === email; });
      if (!user) return json({ ok: false, reason: "no_user", allEmails: users.map(function (u) { return u.email; }) });
      var storedPw = String(user.password || "");
      return json({
        ok: false,
        reason: "password_mismatch",
        storedPw: storedPw,
        storedPwBytes: storedPw.split("").map(function (c) { return c.charCodeAt(0); }),
        typedPw: password,
        typedPwBytes: password.split("").map(function (c) { return c.charCodeAt(0); }),
        storedLen: storedPw.length,
        typedLen: password.length,
        match: storedPw === password
      });
    }
    if (action === "register") return json(registerUser(body));
    if (action === "getStudentDashboard") return json(getStudentDashboard(body));
    if (action === "createRegistration") return json(createRegistration(body));
    if (action === "updateStudentRegistration") return json(updateStudentRegistration(body));
    if (action === "saveSubmission") return json(saveSubmission(body));
    if (action === "getGuidanceList") return json(getLecturerList(body, "guidance"));
    if (action === "getReviewList") return json(getLecturerList(body, "review"));
    if (action === "getCouncilList") return json(getLecturerList(body, "council"));
    if (action === "saveScore") return json(saveScore(body));
    if (action === "saveReviewComment") return json(saveReviewComment(body));
    if (action === "getAllScores") return json(getAllScores(body));
    if (action === "getTBMDashboard") return json(getTBMDashboard(body));
    if (action === "openLecturerSlots") return json(openLecturerSlots(body));
    if (action === "approveRegistrationsBulk") return json(approveRegistrationsBulk(body));
    if (action === "updateRegistrationStatus") return json(updateRegistrationStatus(body));
    if (action === "assignCouncil") return json(assignCouncil(body));
    if (action === "getStudentTimeline") return json(getStudentTimeline(body));
    if (action === "uploadPdfFile") return json(uploadPdfFile(body));
    if (action === "getAuditLogs") return json(getAuditLogs(body));
    if (action === "getAllUsers") return json(getAllUsers(body));
    if (action === "approveUser") return json(approveUser(body));
    if (action === "rejectUser") return json(rejectUser(body));
    if (action === "updateUserProfile" || action === "updateProfile") return json(updateUserProfile(body));
    if (action === "changePassword") return json(changePassword(body));
    if (action === "changeUserRole") return json(changeUserRole(body));
    if (action === "deactivateUser") return json(deactivateUser(body));
    if (action === "activateUser") return json(activateUser(body));
    if (action === "updateLecturerQuota") return json(updateLecturerQuota(body));
    if (action === "sendCouncilNotification") return json(sendCouncilNotification(body));
    if (action === "getTopicSuggestions") return json(getTopicSuggestions(body));
    if (action === "createTopicSuggestion") return json(createTopicSuggestion(body));
    if (action === "approveTopicSuggestion") return json(approveTopicSuggestion(body));
    if (action === "getPeriods") return json(getPeriods(body));
    if (action === "savePeriod") return json(savePeriod(body));
    if (action === "saveInternshipForm") return json(saveInternshipForm(body));
    if (action === "getRevisionStatus") return json(getRevisionStatus(body));
    if (action === "submitRevision") return json(submitRevision(body));
    if (action === "approveRevisionGVHD") return json(approveRevisionGVHD(body));
    if (action === "approveRevisionChairman") return json(approveRevisionChairman(body));
    if (action === "getStatistics") return json(getStatistics(body));
    if (action === "getChairmanDashboard") return json(getChairmanDashboard(body));
    if (action === "getSecretaryDashboard") return json(getSecretaryDashboard(body));
    if (action === "updateCouncilStatus") return json(updateCouncilStatus(body));
    if (action === "saveFinalScore") return json(saveFinalScore(body));
    if (action === "saveCouncilMinutesUrl") return json(saveCouncilMinutesUrl(body));
    if (action === "getCouncilMinutes") return json(getCouncilMinutes(body));
    if (action === "getRevisionApprovals") return json(getRevisionApprovals(body));
    if (action === "ensureSheetStructure") return json(ensureSheetStructure(body));
    if (action === "repairScoresComments") return json(repairScoresCommentsInSheet(body));
    if (action === "repairScoresSync") return json(repairScoresSyncScoreColumn(body));

    return json({ ok: false, message: "Unknown action: " + action });
  } catch (err) {
    return json({ ok: false, message: err.message + " (line: " + err.lineNumber + ")" });
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  Object.keys(CONFIG.SHEETS).forEach(function (sheetName) {
    const headers = CONFIG.SHEETS[sheetName];
    let sh = ss.getSheetByName(sheetName);
    if (!sh) sh = ss.insertSheet(sheetName);
    sh.clearContents();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  });
}

/**
 * Đồng bộ cấu trúc Google Sheet với CONFIG.SHEETS: tạo sheet thiếu, thêm cột thiếu (vd. minutesUrl).
 * Không xóa dữ liệu. Hàng tiêu đề cột được tìm trong 15 dòng đầu (>=2 tên cột trùng CONFIG).
 * API (doPost): can adminKey = CONFIG.ADMIN_REGISTER_KEY.
 * Editor: runEnsureSourceTemplateSync() — dùng SOURCE_DATA_SPREADSHEET_ID (template KLTN).
 */
function ensureSheetStructure(payload) {
  payload = payload || {};
  if (!payload.adminKey || payload.adminKey !== CONFIG.ADMIN_REGISTER_KEY) {
    return { ok: false, message: "Can adminKey hop le (CONFIG.ADMIN_REGISTER_KEY)" };
  }
  return ensureSheetStructureInternal(payload);
}

function ensureSheetStructureInternal(payload) {
  payload = payload || {};
  var id = payload.spreadsheetId || CONFIG.SPREADSHEET_ID || "";
  if (!id || String(id).indexOf("REPLACE") === 0) {
    id = CONFIG.SOURCE_DATA_SPREADSHEET_ID || "";
  }
  if (!id) {
    return { ok: false, message: "Thieu spreadsheetId hoac chua cau hinh SPREADSHEET_ID / SOURCE_DATA_SPREADSHEET_ID" };
  }

  var ss = SpreadsheetApp.openById(id);
  var names = Object.keys(CONFIG.SHEETS);
  var report = [];

  for (var si = 0; si < names.length; si++) {
    var sheetName = names[si];
    var expected = CONFIG.SHEETS[sheetName];
    var sh = ss.getSheetByName(sheetName);
    if (!sh) {
      sh = ss.insertSheet(sheetName);
      sh.getRange(1, 1, 1, expected.length).setValues([expected]);
      report.push({ sheet: sheetName, action: "created", columns: expected.length });
      continue;
    }

    var lastRow = sh.getLastRow();
    var maxScanRows = Math.min(Math.max(lastRow, 1), 15);
    var maxCol = Math.max(sh.getLastColumn(), 1);
    var values = sh.getRange(1, 1, maxScanRows, maxCol).getValues();

    var headerRowIdx = -1;
    for (var r = 0; r < values.length; r++) {
      var row = values[r];
      var norm = row.map(function (c) { return String(c || "").trim().toLowerCase(); });
      var score = 0;
      for (var e = 0; e < expected.length; e++) {
        if (norm.indexOf(String(expected[e]).toLowerCase()) !== -1) score++;
      }
      if (score >= 2) {
        headerRowIdx = r;
        break;
      }
    }

    if (headerRowIdx === -1) {
      report.push({
        sheet: sheetName,
        action: "skip",
        reason: "Khong tim thay hang header (can it nhat 2 ten cot trung CONFIG trong 15 dong dau)"
      });
      continue;
    }

    maxCol = Math.max(sh.getLastColumn(), 1);
    var headerRow = sh.getRange(headerRowIdx + 1, 1, headerRowIdx + 1, maxCol).getValues()[0];
    var normHeader = headerRow.map(function (c) { return String(c || "").trim().toLowerCase(); });
    var added = [];

    for (var c = 0; c < expected.length; c++) {
      var colName = expected[c];
      var key = String(colName).toLowerCase();
      if (normHeader.indexOf(key) === -1) {
        var newCol = sh.getLastColumn() + 1;
        sh.getRange(headerRowIdx + 1, newCol).setValue(colName);
        normHeader.push(key);
        added.push(colName);
      }
    }
    report.push({
      sheet: sheetName,
      action: added.length ? "columns_added" : "ok",
      added: added
    });
  }

  return {
    ok: true,
    message: "Dong bo cau truc xong. Kiem tra mang report.",
    data: { spreadsheetId: id, report: report }
  };
}

/** Chạy trong Apps Script Editor (Run) để cập nhật file mẫu SOURCE_DATA_SPREADSHEET_ID */
function runEnsureSourceTemplateSync() {
  return ensureSheetStructureInternal({ spreadsheetId: CONFIG.SOURCE_DATA_SPREADSHEET_ID });
}

function createBackendTemplateSpreadsheet() {
  const ss = SpreadsheetApp.create("KLTN Portal Backend Template");
  const newId = ss.getId();
  const oldId = CONFIG.SPREADSHEET_ID;
  CONFIG.SPREADSHEET_ID = newId;
  setupSheets();
  seedSampleData();
  CONFIG.SPREADSHEET_ID = oldId;
  return { ok: true, data: { spreadsheetId: newId, url: ss.getUrl() } };
}

function seedSampleData() {
  const target = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const now = new Date().toISOString();

  const users = [
    ["sv01@univ.edu.vn", "123456", "Nguyen Van A", "SV", "CNTT", "Dai hoc", "", "20520001", "APPROVED", now],
    ["sv02@univ.edu.vn", "123456", "Tran Thi B", "SV", "HTTT", "Dai hoc", "", "20520002", "APPROVED", now],
    ["sv03@univ.edu.vn", "123456", "Le Van C", "SV", "CNTT", "Dai hoc", "", "20520003", "APPROVED", now],
    ["gv01@univ.edu.vn", "123456", "Le Giang Vien 1", "GV", "CNTT", "Dai hoc", "0901000001", "", "APPROVED", now],
    ["gv02@univ.edu.vn", "123456", "Pham Giang Vien 2", "GV", "HTTT", "Dai hoc", "0901000002", "", "APPROVED", now],
    ["gv03@univ.edu.vn", "123456", "Nguyen Giang Vien 3", "GV", "CNTT", "Dai hoc", "0901000003", "", "APPROVED", now],
    ["tbm@univ.edu.vn", "123456", "Truong Bo Mon", "TBM", "CNTT", "Dai hoc", "0901000010", "", "APPROVED", now],
    ["thuky@univ.edu.vn", "123456", "Thu Ky Khoa", "THUKY", "CNTT", "Dai hoc", "0901000020", "", "APPROVED", now],
    ["chutich@univ.edu.vn", "123456", "Chu Tich Hoi Dong", "CHUTICH", "CNTT", "Dai hoc", "0901000030", "", "APPROVED", now],
    ["admin@univ.edu.vn", "admin123", "System Admin", "ADMIN", "CNTT", "Dai hoc", "0901000099", "", "APPROVED", now]
  ];

  const students = [
    ["sv01@univ.edu.vn", "20520001", "BCTT_APPROVED", "gv01@univ.edu.vn", "", ""],
    ["sv02@univ.edu.vn", "20520002", "KLTN_APPROVED", "gv02@univ.edu.vn", "gv01@univ.edu.vn", ""],
    ["sv03@univ.edu.vn", "20520003", "NEW", "", "", ""]
  ];

  const lecturers = [
    ["gv01@univ.edu.vn", 8, 2, "CNTT,AI,Data", "Machine Learning, Deep Learning"],
    ["gv02@univ.edu.vn", 6, 1, "HTTT,ERP,BI", "Business Intelligence, ERP"],
    ["gv03@univ.edu.vn", 10, 0, "CNTT,Cloud,Security", "Cloud Computing, Cyber Security"]
  ];

  const topics = [
    ["topic-01", "Xay dung dashboard KPI doanh nghiep", "CNTT", "sv01@univ.edu.vn", "ACTIVE", ""],
    ["topic-02", "Phan tich du lieu sinh vien", "HTTT", "sv02@univ.edu.vn", "ACTIVE", ""],
    ["topic-03", "Ung dung AI trong cham soc suc khoe", "CNTT", "sv03@univ.edu.vn", "ACTIVE", ""]
  ];

  const registrations = [
    ["reg-01", "sv01@univ.edu.vn", "BCTT", "topic-01", "Xay dung dashboard KPI doanh nghiep", "gv01@univ.edu.vn", "APPROVED", "2026-1", now, now],
    ["reg-02", "sv02@univ.edu.vn", "BCTT", "topic-02", "Phan tich du lieu sinh vien", "gv02@univ.edu.vn", "APPROVED", "2026-1", now, now],
    ["reg-03", "sv02@univ.edu.vn", "KLTN", "topic-02", "Phan tich du lieu sinh vien", "gv01@univ.edu.vn", "APPROVED", "2026-1", now, now]
  ];

  const submissions = [
    ["sv01@univ.edu.vn", "BCTT", "https://drive.google.com/sample-bctt", "", "8.5", now, "YES", now],
    ["sv02@univ.edu.vn", "BCTT", "https://drive.google.com/sample-bctt2", "", "9.0", now, "YES", now],
    ["sv02@univ.edu.vn", "KLTN", "https://drive.google.com/sample-kltn", "", "", now, "PENDING", ""]
  ];

  const councils = [
    ["sv02@univ.edu.vn", "gv01@univ.edu.vn", "gv02@univ.edu.vn", "chutich@univ.edu.vn", "thuky@univ.edu.vn", "2026-07-10 08:00", "Phong A.201", "PENDING", "", ""]
  ];

  const scores = [
    // KLTN (0–12): rubric o r1..r8 + rubricTotal; cot comment chi nhan xet chu
    ["sc-01", "sv02@univ.edu.vn", "KLTN", "GVHD", 8.5, "KLTN GVHD: bai lam tot, co yeu to sang tao; can hoan thien phan thuc nghiem.", now, 0.75, 0.75, 1.25, 1.25, 2.0, 0.75, 0.75, 1.0, 8.5],
    ["sc-02", "sv02@univ.edu.vn", "KLTN", "GVPB", 8.0, "KLTN GVPB: phan tich kha toan dien; co cau hoi ve scale va do chinh xac mo hinh.", now, 0.75, 0.75, 1.0, 1.25, 1.5, 0.75, 0.75, 1.25, 8.0],
    ["sc-03", "sv02@univ.edu.vn", "KLTN", "CHUTICH", 8.5, "KLTN Chu tich: trinh bay tot; tra loi duoc cau hoi phan bien.", now, 0.75, 0.75, 1.25, 1.5, 1.75, 0.75, 0.75, 1.0, 8.5],

    // BCTT (0–10): rubric o r1..r8 + rubricTotal; cot comment chi nhan xet chu
    ["sc-04", "sv02@univ.edu.vn", "BCTT", "GVHD", 8.5, "BCTT GVHD: bai lam tot, gia tri thuc tien; can bo sung tai lieu.", now, 0.75, 0.75, 1.5, 1.25, 1.5, 0.75, 0.5, 1.5, 8.5],
    ["sc-05", "sv02@univ.edu.vn", "BCTT", "GVPB", 9.0, "BCTT GVPB: phan tich sau sac; phuong phap khoa hoc; ket qua dang tin cay.", now, 0.75, 0.75, 1.75, 1.25, 1.5, 0.75, 0.75, 1.5, 9.0],
    ["sc-06", "sv02@univ.edu.vn", "BCTT", "CHUTICH", 8.0, "BCTT Chu tich: dap ung yeu cau; co diem tot ve noi dung va tra loi cau hoi.", now, 0.75, 0.5, 1.25, 1.25, 1.5, 0.75, 0.75, 1.25, 8.0]
  ];

  const revisions = [
    ["rev-01", "sv02@univ.edu.vn", "", "", now, "YES", now, "PENDING", "", ""]
  ];

  const topicSuggestions = [
    ["ts-01", "gv01@univ.edu.vn", "He thong nhan diem gian lan truc tuyen", "AI", "Xay dung he thong phat hien gian lan dua tren AI", "APPROVED", now],
    ["ts-02", "gv02@univ.edu.vn", "Ung dung blockchain trong quan ly chuoi cung ung", "HTTT", "Ung dung cong nghe blockchain de tang cuong minh bach trong chuoi cung ung", "APPROVED", now]
  ];

  const periods = [
    ["p-2026-1", "Hoc ky 2026-1", "2026-04-15", "2026-06-30", "2026-07-15", "ACTIVE"]
  ];

  clearDataRows(target.getSheetByName("USERS"));
  clearDataRows(target.getSheetByName("STUDENTS"));
  clearDataRows(target.getSheetByName("LECTURERS"));
  clearDataRows(target.getSheetByName("TOPICS"));
  clearDataRows(target.getSheetByName("REGISTRATIONS"));
  clearDataRows(target.getSheetByName("SUBMISSIONS"));
  clearDataRows(target.getSheetByName("COUNCILS"));
  clearDataRows(target.getSheetByName("SCORES"));
  clearDataRows(target.getSheetByName("REVISIONS"));
  clearDataRows(target.getSheetByName("TOPIC_SUGGESTIONS"));
  clearDataRows(target.getSheetByName("PERIODS"));
  clearDataRows(target.getSheetByName("INTERNSHIP_FORMS"));
  clearDataRows(target.getSheetByName("AUDIT_LOGS"));

  writeSheetRows(target.getSheetByName("USERS"), users);
  writeSheetRows(target.getSheetByName("STUDENTS"), students);
  writeSheetRows(target.getSheetByName("LECTURERS"), lecturers);
  writeSheetRows(target.getSheetByName("TOPICS"), topics);
  writeSheetRows(target.getSheetByName("REGISTRATIONS"), registrations);
  writeSheetRows(target.getSheetByName("SUBMISSIONS"), submissions);
  writeSheetRows(target.getSheetByName("COUNCILS"), councils);
  writeSheetRows(target.getSheetByName("SCORES"), scores);
  writeSheetRows(target.getSheetByName("REVISIONS"), revisions);
  writeSheetRows(target.getSheetByName("TOPIC_SUGGESTIONS"), topicSuggestions);
  writeSheetRows(target.getSheetByName("PERIODS"), periods);

  return { ok: true, message: "Seed sample completed" };
}

function createSourceDataTemplate() {
  const source = SpreadsheetApp.openById(CONFIG.SOURCE_DATA_SPREADSHEET_ID);
  let sh = source.getSheetByName("Data");
  if (!sh) sh = source.insertSheet("Data");
  sh.clearContents();
  const headers = ["email", "name", "role", "major", "trainingSystem", "mssv", "quota", "majors"];
  const rows = [
    ["sv03@univ.edu.vn", "Le Sinh Vien 3", "SV", "CNTT", "Dai hoc", "20520003", "", ""],
    ["gv03@univ.edu.vn", "Nguyen Giang Vien 3", "GV", "CNTT", "Dai hoc", "", "10", "CNTT,Cloud"]
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return { ok: true };
}

function login(payload) {
  if (!spreadsheetConfigured()) {
    return { ok: false, message: "Chua cau hinh SPREADSHEET_ID trong Code.gs (Google Apps Script)." };
  }
  const users = readObjects("USERS");
  var loginEmail = String(payload.email || "").trim().toLowerCase();
  var loginPassword = String(payload.password || "").trim();
  // Tách rõ lỗi "sai email" vs "sai mật khẩu" để dễ debug.
  var userByEmail = users.find(function (u) {
    return String(u.email || "").toLowerCase() === loginEmail;
  });
  if (!userByEmail) return { ok: false, message: "Sai email" };

  // Google Sheets có thể tự convert ô "password" dạng số sang kiểu number khi đọc.
  var storedPassword = String(userByEmail.password || "").trim();
  if (storedPassword !== loginPassword) return { ok: false, message: "Sai mat khau" };

  var user = userByEmail;
  if (user.status === "PENDING") return { ok: false, message: "Tai khoan chua duoc duyet. Vui long lien he admin.", user: { email: user.email, status: "PENDING" } };
  if (user.status === "INACTIVE") return { ok: false, message: "Tai khoan da bi khoa. Vui long lien he admin." };

  var info = {};
  if (user.role === "SV") {
    var st = readObjects("STUDENTS").find(function (s) { return s.email === user.email; }) || { status: "NEW" };
    info = { status: st.status, mssv: st.mssv, bcttLecturer: st.bcttLecturer, kltnLecturer: st.kltnLecturer };
  } else if (user.role === "GV" || user.role === "THUKY" || user.role === "CHUTICH") {
    var lt = readObjects("LECTURERS").find(function (l) { return l.email === user.email; }) || {};
    info = { quota: lt.quota, currentSlot: lt.currentSlot, majors: lt.majors, expertise: lt.expertise };
  }

  var fullUser = { email: user.email, name: user.name, role: user.role, major: user.major, trainingSystem: user.trainingSystem, phone: user.phone, mssv: user.mssv, status: user.status };
  Object.keys(info).forEach(function (k) { fullUser[k] = info[k]; });

  writeAuditLog(user.role || "UNKNOWN", user.email, "LOGIN", user.email, "User login success");
  return { ok: true, data: fullUser };
}

function registerUser(payload) {
  var email = String(payload.email || "").trim().toLowerCase();
  var password = String(payload.password || "").trim();
  var name = String(payload.name || "").trim();
  var major = String(payload.major || "").trim();
  var trainingSystem = String(payload.trainingSystem || payload.heDaoTao || "").trim();
  var mssv = String(payload.mssv || "").trim();
  var phone = String(payload.phone || "").trim();
  var role = String(payload.role || "SV").trim().toUpperCase();

  if (!email || !password || !name) return { ok: false, message: "Thieu truong bat buoc" };
  if (password.length < 6) return { ok: false, message: "Mat khau phai it nhat 6 ky tu" };
  if (!spreadsheetConfigured()) {
    return { ok: false, message: "Chua cau hinh SPREADSHEET_ID trong Code.gs (Google Apps Script)." };
  }
  var users = readObjects("USERS");
  if (users.some(function (u) { return String(u.email || "").toLowerCase() === email; })) {
    return { ok: false, message: "Email da ton tai" };
  }

  if (role === "ADMIN") {
    if (payload.adminKey !== CONFIG.ADMIN_REGISTER_KEY) {
      role = "SV";
    }
  }

  var now = new Date().toISOString();
  var newUser = [email, password, name, role, major, trainingSystem, phone, mssv, "PENDING", now];
  if (!appendRow("USERS", newUser)) {
    return { ok: false, message: "Khong ghi duoc du lieu vao sheet USERS. Kiem tra SPREADSHEET_ID va quyen truy cap." };
  }

  if (role === "SV") {
    if (!appendRow("STUDENTS", [email, mssv, "NEW", "", "", ""])) {
      return { ok: false, message: "Ghi USERS thanh cong nhung khong ghi duoc STUDENTS. Vui long lien he admin." };
    }
  } else if (role === "GV" || role === "THUKY" || role === "CHUTICH") {
    if (!appendRow("LECTURERS", [email, Number(payload.quota || 10), 0, String(payload.majors || major), ""])) {
      return { ok: false, message: "Ghi USERS thanh cong nhung khong ghi duoc LECTURERS. Vui long lien he admin." };
    }
  }

  writeAuditLog(role, email, "REGISTER", email, "User self-registered as " + role);
  return { ok: true, data: { email: email, role: role, name: name, major: major, trainingSystem: trainingSystem, status: "PENDING" } };
}

function getStudentDashboard(payload) {
  var email = payload.email;
  var users = readObjects("USERS");
  var students = readObjects("STUDENTS");
  var student = students.find(function (s) { return String(s.email || "").toLowerCase() === String(email || "").toLowerCase(); }) || null;
  var userInfo = users.find(function (u) { return String(u.email || "").toLowerCase() === String(email || "").toLowerCase(); }) || null;

  if (!userInfo) {
    return { ok: false, message: "Email '" + email + "' khong ton tai trong sheet USERS. Vui long kiem tra hoac yeu cau admin tao tai khoan." };
  }
  if (userInfo.role && userInfo.role.toUpperCase() !== "SV") {
    return { ok: false, message: "Tai khoan '" + email + "' khong phai sinh vien (role = " + userInfo.role + "). Chi sinh vien (SV) moi duoc truy cap trang nay." };
  }
  if (!student) {
    return { ok: false, message: "Sinh vien '" + email + "' chua co trong sheet STUDENTS. Vui long lien he TBM de them vao danh sach sinh vien." };
  }
  if (student.status && student.status.toUpperCase() !== "APPROVED" && student.status !== "PENDING" && student.status !== "NEW") {
    // status khac PENDING/APPROVED/NEW -> tai khoan chua duyet, chi hien thong tin co ban
  }

  var studentObj = student || { status: "NEW" };
  if (userInfo.name && !studentObj.name) studentObj.name = userInfo.name;
  if (userInfo.mssv && !studentObj.mssv) studentObj.mssv = userInfo.mssv;
  if (userInfo.major && !studentObj.major) studentObj.major = userInfo.major;
  if (userInfo.trainingSystem && !studentObj.trainingSystem) studentObj.trainingSystem = userInfo.trainingSystem;

  var regs = readObjects("REGISTRATIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var subs = readObjects("SUBMISSIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var councils = readObjects("COUNCILS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var revisions = readObjects("REVISIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var scoresRaw = readObjects("SCORES").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var scores = dedupeEnrichedScoresByTypeRole(scoresRaw.map(enrichScoreRow));
  var periods = readObjects("PERIODS").filter(function (x) { return x.status === "ACTIVE"; });
  var suggestions = readObjects("TOPIC_SUGGESTIONS").filter(function (x) { return x.status === "APPROVED"; });
  var topics = readObjects("TOPICS");
  regs.forEach(function (r) {
    var t = topics.find(function (x) { return String(x.id || "").toLowerCase() === String(r.topic || "").toLowerCase(); });
    r.topicField = t ? (t.field || "") : "";
  });

  // Lấy danh sách GV, loại bỏ trùng lặp (cùng email chỉ giữ 1 bản ghi đầu tiên)
  var lecturersAll = readObjects("LECTURERS");
  var seenEmails = {};
  var lecturers = [];
  lecturersAll.forEach(function (l) {
    var key = String(l.email || "").toLowerCase();
    if (key && !seenEmails[key]) {
      seenEmails[key] = true;
      var info = users.find(function (u) { return String(u.email || "").toLowerCase() === key; }) || {};
      lecturers.push({ email: l.email, name: info.name || l.email || key, majors: l.majors || "", quota: l.quota, currentSlot: l.currentSlot, expertise: l.expertise });
    }
  });

  var fields = collectRegistrationFields();

  return {
    ok: true,
    data: {
      student: studentObj,
      registrations: regs,
      submissions: subs,
      councils: councils,
      revisions: revisions,
      scores: scores.map(enrichScoreRow),
      lecturers: lecturers,
      fields: fields,
      periods: periods,
      suggestions: suggestions
    }
  };
}

function createRegistration(payload) {
  var studentEmail = payload.student;
  var regType = payload.type;
  var lecturerEmail = payload.lecturer;

  var students = readObjects("STUDENTS");
  var student = students.find(function (s) { return String(s.email || "").toLowerCase() === String(studentEmail || "").toLowerCase(); });
  if (!student) return { ok: false, message: "Sinh vien khong ton tai" };

  if (regType === "KLTN" && student.status !== "BCTT_APPROVED" && student.status !== "BCTT_DONE" && student.status !== "KLTN_REGISTERED") {
    return { ok: false, message: "Phai hoan thanh BCTT (duyet) moi duoc dang ky KLTN" };
  }

  var regs = readObjects("REGISTRATIONS");
  var existingReg = regs.find(function (r) {
    return String(r.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && r.type === regType;
  });
  if (existingReg) {
    return { ok: false, message: "Da ton tai dang ky " + regType + " cho sinh vien nay" };
  }

  var lecturers = readObjects("LECTURERS");
  var l = lecturers.find(function (x) { return x.email === lecturerEmail; });
  if (!l) return { ok: false, message: "Giang vien khong ton tai" };
  if (Number(l.currentSlot || 0) >= Number(l.quota || 0)) return { ok: false, message: "Giang vien da het slot" };

  var id = "reg-" + Utilities.getUuid().substring(0, 8);
  var now = new Date().toISOString();
  var dot = payload.dot || "2026-1";
  var topicName = payload.topic || "";

  appendRow("REGISTRATIONS", [id, studentEmail, regType, id, topicName, lecturerEmail, "PENDING", dot, now, ""]);
  appendRow("TOPICS", [id, topicName, payload.field || "", studentEmail, "ACTIVE", ""]);

  incrementLecturerSlot(lecturerEmail);

  var newStatus = regType === "BCTT" ? "BCTT_REGISTERED" : "KLTN_REGISTERED";
  updateStudentStatus(studentEmail, newStatus);
  // Đồng bộ GVHD lên sheet STUDENTS (bcttLecturer / kltnLecturer) — trước đây chỉ cập nhật status nên các cột FK trống.
  if (regType === "BCTT") {
    patchStudentRowByEmail(studentEmail, { bcttLecturer: lecturerEmail });
  } else if (regType === "KLTN") {
    patchStudentRowByEmail(studentEmail, { kltnLecturer: lecturerEmail });
  }

  writeAuditLog("SV", studentEmail, "CREATE_REGISTRATION", id, regType + " - " + topicName + " - GV:" + lecturerEmail);
  return { ok: true, data: { id: id, status: newStatus } };
}

function updateTopicField(topicId, field) {
  if (!topicId) return;
  var hc = getHeaderColumnMap("TOPICS");
  if (!hc) return;
  var idIdx = hc.map["id"];
  var fieldIdx = hc.map["field"];
  if (idIdx === undefined || fieldIdx === undefined) return;
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][idIdx]) === String(topicId)) {
      hc.sheet.getRange(i + 1, fieldIdx + 1).setValue(field || "");
      return;
    }
  }
}

/** SV chỉnh đợt / lĩnh vực / tên đề tài khi đăng ký còn PENDING. */
function updateStudentRegistration(payload) {
  var studentEmail = String(payload.student || "").trim().toLowerCase();
  var regType = payload.type || "BCTT";
  var newDot = payload.dot;
  var newField = payload.field;
  var newTopicName = payload.topic;

  var hc = getHeaderColumnMap("REGISTRATIONS");
  if (!hc) return { ok: false, message: "Khong doc duoc REGISTRATIONS" };
  var idIdx = hc.map["id"];
  var studentIdx = hc.map["student"];
  var typeIdx = hc.map["type"];
  var statusIdx = hc.map["status"];
  var dotIdx = hc.map["dot"];
  var topicNameIdx = hc.map["topicname"];
  var topicColIdx = hc.map["topic"];

  if (idIdx === undefined || studentIdx === undefined || typeIdx === undefined || statusIdx === undefined) {
    return { ok: false, message: "Sheet REGISTRATIONS thieu cot bat buoc" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    var st = String(hc.values[i][studentIdx] || "").toLowerCase();
    var ty = hc.values[i][typeIdx];
    if (st !== studentEmail || ty !== regType) continue;
    if (String(hc.values[i][statusIdx] || "").toUpperCase() !== "PENDING") {
      return { ok: false, message: "Chi cap nhat khi dang ky dang cho duyet (PENDING)" };
    }

    var rowNum = i + 1;
    if (newDot !== undefined && dotIdx !== undefined) {
      hc.sheet.getRange(rowNum, dotIdx + 1).setValue(newDot);
    }
    if (newTopicName !== undefined && topicNameIdx !== undefined) {
      hc.sheet.getRange(rowNum, topicNameIdx + 1).setValue(newTopicName);
    }

    var topicId = topicColIdx !== undefined ? hc.values[i][topicColIdx] : "";
    if (newField !== undefined && topicId) {
      updateTopicField(String(topicId), newField);
    }

    writeAuditLog("SV", studentEmail, "UPDATE_STUDENT_REGISTRATION", regType, String(newDot || "") + " | field:" + String(newField || ""));
    return { ok: true, message: "Cap nhat dang ky thanh cong" };
  }
  return { ok: false, message: "Khong tim thay dang ky PENDING cho loai " + regType };
}

/** SV được nộp bài KLTN chỉnh sửa khi đã bảo vệ: STUDENTS.status = DEFENDED hoặc COUNCILS.councilStatus = DEFENDED */
function studentMaySubmitKltnRevision(studentEmail) {
  var want = String(studentEmail || "").trim().toLowerCase();
  if (!want) return false;
  var students = readObjects("STUDENTS");
  var st = students.find(function (s) { return String(s.email || "").toLowerCase() === want; });
  if (st && String(st.status || "").toUpperCase() === "DEFENDED") return true;
  var councils = readObjects("COUNCILS");
  for (var j = 0; j < councils.length; j++) {
    if (String(councils[j].student || "").toLowerCase() !== want) continue;
    if (String(councils[j].councilStatus || "").toUpperCase() === "DEFENDED") return true;
  }
  return false;
}

function saveSubmission(payload) {
  var studentEmail = payload.student;
  var subType = payload.type;
  var fileUrl = payload.file || "";
  var turnitin = payload.turnitin || "";
  var score = payload.score || "";
  var now = new Date().toISOString();

  if (String(subType || "").toUpperCase() === "KLTN_REVISION" && !studentMaySubmitKltnRevision(studentEmail)) {
    return { ok: false, message: "Chi duoc nop bai chinh sua sau khi hoi dong da bao ve (DEFENDED tren COUNCILS hoac STUDENTS)." };
  }

  var subs = readObjects("SUBMISSIONS");
  var exists = subs.find(function (s) {
    return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && s.type === subType;
  });

  if (exists) {
    updateSubmissionRow(studentEmail, subType, fileUrl, turnitin, score, now);
  } else {
    appendRow("SUBMISSIONS", [studentEmail, subType, fileUrl, turnitin, score, now, "PENDING", ""]);
  }

  writeAuditLog(payload.role || "SV", studentEmail, "SAVE_SUBMISSION", subType, fileUrl || "URL updated");
  // Phiếu xác nhận thực tập: sinh viên nộp qua SUBMISSIONS type PHIEU_TT → ghi link vào STUDENTS.internshipForm.
  if (fileUrl && subType === "PHIEU_TT") {
    patchStudentRowByEmail(studentEmail, { internshipForm: fileUrl });
  }
  return { ok: true, message: "Luu nop bai thanh cong" };
}

function saveInternshipForm(payload) {
  var studentEmail = payload.student;
  var fileUrl = payload.file || "";
  var now = new Date().toISOString();

  var forms = readObjects("INTERNSHIP_FORMS");
  var exists = forms.find(function (f) { return String(f.student || "").toLowerCase() === String(studentEmail || "").toLowerCase(); });

  if (exists) {
    updateInternshipForm(studentEmail, fileUrl, now);
  } else {
    appendRow("INTERNSHIP_FORMS", [studentEmail, fileUrl, now, "PENDING"]);
  }

  writeAuditLog("SV", studentEmail, "SAVE_INTERNSHIP_FORM", studentEmail, fileUrl);
  if (fileUrl) {
    patchStudentRowByEmail(studentEmail, { internshipForm: fileUrl });
  }
  return { ok: true, message: "Luu phieu xac nhan thuc tap thanh cong" };
}

/** Khớp frontend KLTN_RUBRIC_CRITERIA — tổng tối đa 10 */
var KLTN_RUBRIC_MAXS = [1, 1, 1, 2, 2, 1, 1, 1];

// BCTT: dùng cùng 8 tiêu chí với KLTN, nhưng tổng max = 10.
// Tương ứng scale (10/12) và làm tròn theo bước 0.25 để tổng đúng 10:
// [TC1..TC8] = [0.75,0.75,1.75,1.75,1.75,0.75,0.75,1.75]
var BCTT_RUBRIC_MAX_TOTAL = 10;
var BCTT_RUBRIC_MAXS = [0.75, 0.75, 1.75, 1.75, 1.75, 0.75, 0.75, 1.75];

/** Tách JSON chấm điểm (v/rubric/total/note) khỏi nhận xét hiển thị — khớp cột comment trên Google Sheet. */
function parseCommentForRubric(comment) {
  if (!comment || typeof comment !== "string") return { note: "", rubric: null, total: null };
  var s = String(comment).trim();
  if (!s) return { note: "", rubric: null, total: null };
  if (s.charAt(0) !== "{") return { note: s, rubric: null, total: null };
  try {
    var o = JSON.parse(s);
    if (!o || typeof o !== "object") return { note: "", rubric: null, total: null };
    var note = o.note != null ? String(o.note) : "";
    var total = o.total != null && o.total !== "" && !isNaN(Number(o.total)) ? Number(o.total) : null;
    var rubric = Array.isArray(o.rubric) && o.rubric.length > 0 ? o.rubric : null;
    if (rubric || total != null) {
      return { note: note, rubric: rubric, total: total };
    }
    if (note) {
      return { note: note, rubric: null, total: null };
    }
  } catch (e) {}
  return { note: "", rubric: null, total: null };
}

function rubricFromScoreColumns(s) {
  var arr = [];
  for (var i = 1; i <= 8; i++) {
    var k = "r" + i;
    if (s[k] === undefined || s[k] === null || s[k] === "") return null;
    var n = Number(s[k]);
    if (isNaN(n)) return null;
    arr.push(n);
  }
  return arr.length === 8 ? arr : null;
}

function sumRubricArray(arr) {
  var t = 0;
  for (var i = 0; i < (arr || []).length; i++) t += Number(arr[i]) || 0;
  return t;
}

/** Đọc rubricTotal từ dòng SCORES (một số template đặt tên cột khác). */
function rubricTotalFromRow(s) {
  if (!s) return null;
  var candidates = ["rubricTotal", "rubrictotal", "rubric_total"];
  for (var i = 0; i < candidates.length; i++) {
    var k = candidates[i];
    if (s[k] !== undefined && s[k] !== null && String(s[k]).trim() !== "" && !isNaN(Number(s[k]))) {
      return Number(s[k]);
    }
  }
  return null;
}

/**
 * Chuẩn hóa một dòng SCORES: comment chỉ còn text note (vd "bài hay").
 * Điểm hiển thị: rubricTotal (cột) → total trong JSON → tổng mảng rubric (7–8 ô đều được).
 * Không dùng cột score khi đã xác định là dòng chấm rubric (JSON hoặc đủ cột r*) — tránh hiển thị 16 sai.
 */
function enrichScoreRow(s) {
  var p = parseCommentForRubric(s.comment);
  var rubricCols = rubricFromScoreColumns(s);
  var rubricArr = rubricCols || p.rubric;
  if (rubricArr && rubricArr.length && s.type === "KLTN") {
    rubricArr = rubricArr.map(function (v, i) {
      var mx = i < KLTN_RUBRIC_MAXS.length ? KLTN_RUBRIC_MAXS[i] : 999;
      var n = Number(v);
      if (isNaN(n) || n < 0) return 0;
      return Math.min(n, mx);
    });
  }

  var fromRubricTotal = rubricTotalFromRow(s);
  var fromJsonTotal = p.total != null && !isNaN(Number(p.total)) ? Number(p.total) : null;
  var fromSum = rubricArr && rubricArr.length > 0 ? sumRubricArray(rubricArr) : null;

  var structuredRubricRow =
    (p.rubric && p.rubric.length > 0) ||
    p.total != null ||
    rubricCols != null ||
    (fromRubricTotal != null);

  var colRaw = s.score;
  var colNum = (colRaw !== undefined && colRaw !== null && String(colRaw).trim() !== "" && !isNaN(Number(colRaw))) ? Number(colRaw) : null;

  var scoreStr = "";
  if (structuredRubricRow) {
    if (fromRubricTotal != null) scoreStr = String(Number(fromRubricTotal.toFixed(2)));
    else if (fromJsonTotal != null) scoreStr = String(Number(fromJsonTotal.toFixed(2)));
    else if (fromSum != null) scoreStr = String(Number(fromSum.toFixed(2)));
    else if (colNum != null) scoreStr = String(Number(colNum.toFixed(2)));
  } else {
    if (colNum != null) scoreStr = String(Number(colNum.toFixed(2)));
    else if (fromRubricTotal != null) scoreStr = String(Number(fromRubricTotal.toFixed(2)));
    else if (fromJsonTotal != null) scoreStr = String(Number(fromJsonTotal.toFixed(2)));
    else scoreStr = "";
  }

  var displayComment = "";
  if (structuredRubricRow) {
    displayComment = p.note != null ? p.note : "";
  } else {
    var raw = String(s.comment || "").trim();
    if (raw.charAt(0) === "{") displayComment = p.note || "";
    else displayComment = raw;
  }

  var out = {};
  for (var key in s) {
    if (Object.prototype.hasOwnProperty.call(s, key)) out[key] = s[key];
  }
  out.score = scoreStr;
  out.comment = displayComment;
  out.rubric = rubricArr && rubricArr.length > 0 ? rubricArr : null;
  out.role = normalizeScoreRoleKey(s.role || "");
  return out;
}

/** Chuẩn hóa role trong SCORES để khớp GVHD / GVPB / CHUTICH (tránh lệch tên cột sheet). */
function normalizeScoreRoleKey(role) {
  var r = String(role || "").trim().toUpperCase().replace(/\s+/g, "").replace(/_/g, "");
  if (r === "GV" || r === "GVHD") return "GVHD";
  if (r === "GVPB" || r === "PHANBIEN") return "GVPB";
  if (r === "CHUTICH" || r === "CHAIRMAN" || r === "CTHD" || r === "CHỦTỊCH") return "CHUTICH";
  return String(role || "").trim();
}
/** Gộp dòng SCORES trùng (cùng type + role): ưu tiên có điểm, sau đó savedAt mới nhất. */
function dedupeEnrichedScoresByTypeRole(enrichedRows) {
  var best = {};
  function hasMeaningfulScore(r) {
    var sc = r.score;
    if (sc === undefined || sc === null) return false;
    if (String(sc).trim() === "") return false;
    return !isNaN(Number(sc));
  }
  for (var i = 0; i < enrichedRows.length; i++) {
    var row = enrichedRows[i];
    var roleK = normalizeScoreRoleKey(row.role);
    var k = String(row.type || "") + "|" + roleK;
    var prev = best[k];
    if (!prev) {
      best[k] = row;
      continue;
    }
    var t1 = new Date(row.savedAt || 0).getTime();
    var t0 = new Date(prev.savedAt || 0).getTime();
    if (hasMeaningfulScore(row) && !hasMeaningfulScore(prev)) best[k] = row;
    else if (!hasMeaningfulScore(row) && hasMeaningfulScore(prev)) continue;
    else if (t1 >= t0) best[k] = row;
  }
  var out = [];
  for (var key in best) {
    if (Object.prototype.hasOwnProperty.call(best, key)) out.push(best[key]);
  }
  return out;
}
/**
 * Ghép điểm TB: không để sheet lưu "0" (hoặc rỗng có nhầm) che mất TB tính từ SCORES.
 * Ưu tiên finalScore sheet khi là số > 0; không thì dùng trung bình các dòng KLTN đã chấm.
 */
function mergeCouncilFinalScore(sheetFinal, computedAvgStr, hasComputed) {
  var raw = sheetFinal;
  if (raw !== undefined && raw !== null && String(raw).trim() !== "" && !isNaN(Number(raw))) {
    var n = Number(raw);
    if (n > 0) return String(n.toFixed(2));
  }
  if (hasComputed && computedAvgStr) return computedAvgStr;
  return "";
}

/**
 * Mot lan: thay comment JSON cu trong sheet SCORES bang chi phan note + chinh cot score theo rubricTotal/tong.
 * Goi API: action "repairScoresComments", role ADMIN hoac TBM.
 */
function repairScoresCommentsInSheet(payload) {
  var role = String((payload && payload.role) || "").toUpperCase();
  if (role !== "ADMIN" && role !== "TBM") {
    return { ok: false, message: "Chi ADMIN/TBM duoc chay repairScoresComments" };
  }
  var rows = readObjects("SCORES");
  var fixed = 0;
  for (var i = 0; i < rows.length; i++) {
    var s = rows[i];
    var c = String(s.comment || "").trim();
    if (!c || c.charAt(0) !== "{") continue;
    var isLegacyRubricJson = false;
    try {
      var jo = JSON.parse(c);
      if (jo && typeof jo === "object") {
        if (Array.isArray(jo.rubric) && jo.rubric.length > 0) isLegacyRubricJson = true;
        else if (jo.total != null && jo.total !== "" && !isNaN(Number(jo.total))) isLegacyRubricJson = true;
      }
    } catch (e2) {}
    if (!isLegacyRubricJson) continue;
    var e = enrichScoreRow(s);
    if (!s.id) continue;
    updateScoreRow(
      s.id,
      s.student,
      s.type,
      s.role,
      e.score,
      e.comment,
      s.savedAt || new Date().toISOString(),
      null,
      null
    );
    fixed++;
  }
  writeAuditLog(role, (payload && payload.by) || role, "REPAIR_SCORES_COMMENTS", String(fixed), "Normalized comment + score");
  return { ok: true, message: "Da chuan hoa " + fixed + " dong SCORES (comment = note, score dong bo)", data: { fixed: fixed } };
}
/**
 * Đồng bộ cột score trên sheet = điểm suy ra từ rubricTotal / r1–r8 / JSON (sau lỗi updateScoreRow cũ ghi nhầm 2–16).
 * Goi API: action "repairScoresSync", role ADMIN hoac TBM.
 */
function repairScoresSyncScoreColumn(payload) {
  var role = String((payload && payload.role) || "").toUpperCase();
  if (role !== "ADMIN" && role !== "TBM") {
    return { ok: false, message: "Chi ADMIN/TBM duoc chay repairScoresSync" };
  }
  var rows = readObjects("SCORES");
  var fixed = 0;
  for (var i = 0; i < rows.length; i++) {
    var s = rows[i];
    if (!s.id) continue;
    var e = enrichScoreRow(s);
    var want = e.score != null ? String(e.score).trim() : "";
    var have = s.score != null ? String(s.score).trim() : "";
    if (!want) continue;
    if (want === have) continue;
    updateScoreRow(
      s.id,
      s.student,
      s.type,
      s.role,
      want,
      undefined,
      s.savedAt || new Date().toISOString(),
      null,
      null
    );
    fixed++;
  }
  writeAuditLog(role, (payload && payload.by) || role, "REPAIR_SCORE_SYNC", String(fixed), "Score = enrich/rubricTotal");
  return { ok: true, message: "Da dong bo " + fixed + " cot score (bang rubricTotal/tong tieu chi)", data: { fixed: fixed } };
}
/** Lĩnh vực / chuyên ngành: mặc định theo template KLTN + từ TOPICS, USERS.major, LECTURERS.majors */
function collectRegistrationFields() {
  var defaults = ["CNTT", "HTTT", "AT", "KTMT", "KHMT", "TKPM", "QLCN", "KDQT", "Ktoan", "TMĐT", "TMDT", "Log", "Mạng Máy Tính", "Công Nghệ Thông Tin"];
  var bucket = {};
  function addToken(tok) {
    var t = String(tok || "").trim();
    if (!t) return;
    bucket[t.toLowerCase()] = t;
  }
  function splitAndAdd(s) {
    if (!s) return;
    String(s).split(/[,;/|]/).forEach(function (x) { addToken(x); });
  }
  defaults.forEach(addToken);
  readObjects("TOPICS").forEach(function (t) { addToken(t.field); });
  readObjects("USERS").forEach(function (u) {
    splitAndAdd(u.major);
  });
  readObjects("LECTURERS").forEach(function (l) {
    splitAndAdd(l.majors);
    splitAndAdd(l.expertise);
  });
  var list = [];
  for (var k in bucket) list.push(bucket[k]);
  list.sort(function (a, b) { return String(a).localeCompare(String(b), "vi", { sensitivity: "base" }); });
  return list;
}

function saveScore(payload) {
  var studentEmail = payload.student;
  var scoreType = payload.type || "KLTN";
  var scorerRole = payload.scorerRole || payload.role || "GV";
  var scoreVal = payload.score;
  // Cot comment tren Google Sheet chi luu nhan xet chu (vd "rat hay"). Rubric luu o r1–r8 + rubricTotal + cot score.
  var notePlain = payload.comment != null ? String(payload.comment) : "";
  var comment = notePlain;

  // Nếu có rubric (KLTN hoặc BCTT...), tính tổng và lưu từng tiêu chí vào cột riêng (r1–r8, rubricTotal)
  var rubricArr = null;
  var rubricTotal = null;
  if (payload.rubric && payload.rubric.length) {
    rubricArr = [];
    rubricTotal = 0;
    for (var ri = 0; ri < payload.rubric.length; ri++) {
      var rv = Number(payload.rubric[ri]);
      if (isNaN(rv)) rv = 0;
      if (rv < 0) rv = 0;
      // Clamp theo bộ tiêu chí cho từng loại bài.
      if (scoreType === "KLTN" && ri < KLTN_RUBRIC_MAXS.length && rv > KLTN_RUBRIC_MAXS[ri]) {
        rv = KLTN_RUBRIC_MAXS[ri];
      }
      if (scoreType === "BCTT" && ri < BCTT_RUBRIC_MAXS.length && rv > BCTT_RUBRIC_MAXS[ri]) {
        rv = BCTT_RUBRIC_MAXS[ri];
      }
      rubricArr.push(rv);
      rubricTotal += rv;
    }
    scoreVal = String(rubricTotal.toFixed(2));
    rubricTotal = Number(scoreVal); // dong bo cot score voi tong rubric
    comment = notePlain;
  }

  var now = new Date().toISOString();
  var id = "sc-" + Utilities.getUuid().substring(0, 8);

  var scores = readObjects("SCORES");
  var existing = scores.find(function (s) {
    return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() &&
           s.type === scoreType &&
           s.role === scorerRole;
  });

  if (existing) {
    updateScoreRow(existing.id, studentEmail, scoreType, scorerRole, scoreVal, comment, now, rubricArr, rubricTotal);
  } else {
    // Thay vì appendRow theo thứ tự cố định (dễ lệch cột nếu sheet có header nhiều dòng),
    // ghi đúng ô theo mapping header.
    appendScoreRowMapped(id, studentEmail, scoreType, scorerRole, scoreVal, comment, now, rubricArr, rubricTotal);
  }

  var allScores = readObjects("SCORES").filter(function (s) {
    return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && s.type === scoreType;
  });

  if (allScores.length > 0) {
    var total = 0, count = 0;
    allScores.forEach(function (s) {
      var e = enrichScoreRow(s);
      if (e.score !== undefined && e.score !== null && e.score !== "" && !isNaN(Number(e.score))) {
        total += Number(e.score);
        count++;
      }
    });
    if (count > 0) {
      var avg = (total / count).toFixed(2);
      updateSubmissionScore(studentEmail, scoreType, avg);
    }
  }

  writeAuditLog(scorerRole, payload.by || studentEmail, "SAVE_SCORE", studentEmail, scoreType + " score=" + scoreVal + " by " + scorerRole);
  return { ok: true, message: "Luu diem thanh cong" };
}

function saveReviewComment(payload) {
  var studentEmail = payload.student;
  var scoreType = payload.type || "KLTN";
  var comment = payload.comment || "";
  var questions = payload.questions || "";
  var now = new Date().toISOString();

  var scores = readObjects("SCORES");
  var existing = scores.find(function (s) {
    return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() &&
           s.type === scoreType &&
           s.role === "GVPB";
  });

  if (existing) {
    updateScoreRow(existing.id, studentEmail, scoreType, "GVPB", existing.score || "", comment + (questions ? "\nCau hoi: " + questions : ""), now);
  } else {
    var id = "sc-" + Utilities.getUuid().substring(0, 8);
    appendRow("SCORES", [id, studentEmail, scoreType, "GVPB", "", comment + (questions ? "\nCau hoi: " + questions : ""), now]);
  }

  writeAuditLog("GV", payload.by || "gvpb", "SAVE_REVIEW_COMMENT", studentEmail, comment.substring(0, 100));
  return { ok: true, message: "Luu nhan xet thanh cong" };
}

function getAllScores(payload) {
  var studentEmail = payload.student;
  var scoreType = payload.type || "KLTN";
  var scores = readObjects("SCORES").filter(function (s) {
    return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && s.type === scoreType;
  });

  var result = { GVHD: null, GVPB: null, CHUTICH: null, THANHVIEN: null };
  scores.forEach(function (s) {
    var key = normalizeScoreRoleKey(s.role || "THANHVIEN");
    if (!key) key = "THANHVIEN";
    var e = enrichScoreRow(s);
    result[key] = {
      score: e.score,
      comment: e.comment,
      rubric: e.rubric,
      savedAt: s.savedAt
    };
  });

  var subs = readObjects("SUBMISSIONS").find(function (s) {
    return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && s.type === scoreType;
  });

  var councils = readObjects("COUNCILS").filter(function (c) {
    return String(c.student || "").toLowerCase() === String(studentEmail || "").toLowerCase();
  });

  return { ok: true, data: { scores: result, submission: subs || {}, council: councils[0] || null } };
}

function getLecturerList(payload, mode) {
  var email = payload.email;
  var regs = readObjects("REGISTRATIONS");
  var subs = readObjects("SUBMISSIONS");
  var users = readObjects("USERS");
  var topics = readObjects("TOPICS");
  var scores = readObjects("SCORES");
  var scorerRole = payload.scorerRole ? String(payload.scorerRole).trim() : "";

  var filtered = [];
  if (mode === "guidance") {
    filtered = regs.filter(function (r) { return String(r.lecturer || "").toLowerCase() === String(email || "").toLowerCase(); });
  } else if (mode === "review") {
    var councils = readObjects("COUNCILS").filter(function (c) {
      return String(c.gvpb || "").toLowerCase() === String(email || "").toLowerCase();
    });
    var studentEmails = councils.map(function (c) { return c.student; });
    filtered = regs.filter(function (r) {
      return studentEmails.indexOf(r.student) !== -1 && String(r.type || "").toUpperCase() === "KLTN";
    });
  } else if (mode === "council") {
    var allCouncils = readObjects("COUNCILS").filter(function (c) {
      return String(c.chairman || "").toLowerCase() === String(email || "").toLowerCase() ||
             String(c.gvhd || "").toLowerCase() === String(email || "").toLowerCase() ||
             String(c.secretary || "").toLowerCase() === String(email || "").toLowerCase();
    });
    var councilStudents = allCouncils.map(function (c) { return c.student; });
    // Hội đồng / chủ tịch / thư ký chỉ chấm KLTN; BCTT do GVHD ở tab Hướng dẫn.
    filtered = regs.filter(function (r) {
      return councilStudents.indexOf(r.student) !== -1 && String(r.type || "").toUpperCase() === "KLTN";
    });
  }

  var merged = filtered.map(function (r) {
    var sub = subs.find(function (s) { return String(s.student || "").toLowerCase() === String(r.student || "").toLowerCase() && s.type === r.type; }) || {};
    var st = users.find(function (u) { return String(u.email || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};
    var stScores = scores.filter(function (s) { return String(s.student || "").toLowerCase() === String(r.student || "").toLowerCase() && s.type === r.type; });
    var myScore = null;
    stScores.forEach(function (s) {
      var rowRole = normalizeScoreRoleKey(s.role);
      var match = false;
      if (scorerRole) {
        match = rowRole === normalizeScoreRoleKey(scorerRole);
      } else {
        match = rowRole === normalizeScoreRoleKey(payload.role);
      }
      if (match) {
        var e = enrichScoreRow(s);
        myScore = {
          score: e.score,
          comment: e.comment,
          rubric: e.rubric
        };
      }
    });
    var topicObj = null;
    // REGISTRATIONS.topic thường là id của TOPICS
    if (r.topic) {
      topicObj = topics.find(function (t) { return String(t.id || "").toLowerCase() === String(r.topic || "").toLowerCase(); }) || null;
    }
    var topicField = topicObj ? (topicObj.field || "") : "";

    return {
      student: r.student,
      studentName: st.name || r.student,
      topic: r.topicName || r.topic,
      topicField: topicField,
      regField: r.field || "",
      type: r.type,
      status: r.status,
      dot: r.dot,
      file: sub.file || "",
      turnitin: sub.turnitin || "",
      score: sub.score || "",
      gvhdApproval: sub.gvhdApproval || "PENDING",
      myScore: myScore,
      lecturer: r.lecturer
    };
  });

  return { ok: true, data: merged };
}

function majorTokensFromString(str) {
  return String(str || "")
    .split(/[,;/|]/)
    .map(function (t) { return t.trim().toLowerCase(); })
    .filter(function (t) { return t.length > 0; });
}

/** Khớp chuyên ngành TBM (USERS.major) với LECTURERS.majors (có thể nhiều token cách nhau bởi , ; / |) */
function lecturerBelongsToTbmMajor(lecturerMajors, tbmMajor) {
  var want = String(tbmMajor || "").trim().toLowerCase();
  if (!want) return true;
  var tokens = majorTokensFromString(lecturerMajors);
  if (tokens.length === 0) {
    var lump = String(lecturerMajors || "").trim().toLowerCase();
    return lump === want;
  }
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i] === want) return true;
  }
  return false;
}

function getTBMDashboard(payload) {
  var users = readObjects("USERS");
  var requestEmail = String((payload && payload.email) || "").trim().toLowerCase();
  var actor = requestEmail
    ? users.find(function (u) { return String(u.email || "").toLowerCase() === requestEmail; }) || null
    : null;
  var actorRole = actor ? String(actor.role || "").trim().toUpperCase() : "";

  var lecturers = readObjects("LECTURERS").map(function (l) {
    var key = String(l.email || "").trim().toLowerCase();
    var info = users.find(function (u) { return String(u.email || "").toLowerCase() === key; }) || {};
    return { email: l.email, name: info.name || l.email, majors: l.majors, quota: l.quota, currentSlot: l.currentSlot, expertise: l.expertise };
  });

  if (actorRole === "TBM" && actor && String(actor.major || "").trim()) {
    var scopeMajor = String(actor.major || "").trim();
    lecturers = lecturers.filter(function (l) {
      return lecturerBelongsToTbmMajor(l.majors, scopeMajor);
    });
  }

  var registrations = readObjects("REGISTRATIONS");
  var students = readObjects("STUDENTS");
  var submissions = readObjects("SUBMISSIONS");
  var councils = readObjects("COUNCILS");
  var revisions = readObjects("REVISIONS");
  var scores = readObjects("SCORES");

  registrations.forEach(function (r) {
    var st = students.find(function (s) { return String(s.email || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};
    r.studentName = usr.name || r.student;
    r.studentMssv = st.mssv || usr.mssv || "";
  });

  submissions.forEach(function (s) {
    var st = students.find(function (st2) { return String(st2.email || "").toLowerCase() === String(s.student || "").toLowerCase(); }) || {};
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(s.student || "").toLowerCase(); }) || {};
    s.studentName = usr.name || s.student;
    s.studentMssv = st.mssv || usr.mssv || "";
  });

  councils.forEach(function (c) {
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(c.student || "").toLowerCase(); }) || {};
    c.studentName = usr.name || c.student;
  });

  revisions.forEach(function (r) {
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};
    r.studentName = usr.name || r.student;
  });

  var pending = registrations.filter(function (r) { return r.status === "PENDING"; });
  var audits = readObjects("AUDIT_LOGS").slice(-500).reverse();

  var scoresEnriched = scores.map(enrichScoreRow);

  return {
    ok: true,
    data: {
      lecturers: lecturers,
      registrations: registrations,
      students: students,
      submissions: submissions,
      councils: councils,
      revisions: revisions,
      scores: scoresEnriched,
      pending: pending.length,
      pendingCount: pending.length
    }
  };
}

function getChairmanDashboard(payload) {
  var email = payload.email;
  var councils = readObjects("COUNCILS").filter(function (c) {
    return String(c.chairman || "").toLowerCase() === String(email || "").toLowerCase();
  });
  var students = readObjects("STUDENTS");
  var users = readObjects("USERS");
  var registrations = readObjects("REGISTRATIONS");
  var scores = readObjects("SCORES");
  var submissions = readObjects("SUBMISSIONS");
  var revisions = readObjects("REVISIONS");

  var result = councils.map(function (c) {
    var st = students.find(function (s) { return String(s.email || "").toLowerCase() === String(c.student || "").toLowerCase(); }) || {};
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(c.student || "").toLowerCase(); }) || {};
    var regKltn = registrations.find(function (r) {
      return String(r.student || "").toLowerCase() === String(c.student || "").toLowerCase() && r.type === "KLTN";
    }) || {};
    var stScores = scores.filter(function (s) { return String(s.student || "").toLowerCase() === String(c.student || "").toLowerCase() && s.type === "KLTN"; });
    var rev = revisions.find(function (r) { return String(r.student || "").toLowerCase() === String(c.student || "").toLowerCase(); });
    var sub = submissions.find(function (s) { return String(s.student || "").toLowerCase() === String(c.student || "").toLowerCase() && s.type === "KLTN"; });

    var scoreBreakdown = {};
    stScores.forEach(function (s) {
      var rk = normalizeScoreRoleKey(s.role);
      var e = enrichScoreRow(s);
      scoreBreakdown[rk] = { score: e.score, comment: e.comment, rubric: e.rubric };
    });

    var finalAvg = 0, cnt = 0;
    stScores.forEach(function (s) {
      var e = enrichScoreRow(s);
      if (e.score && !isNaN(Number(e.score))) { finalAvg += Number(e.score); cnt++; }
    });
    var finalAvgStr = cnt > 0 ? (finalAvg / cnt).toFixed(2) : "";

    var gvhdSc = scoreBreakdown.GVHD;

    return {
      student: c.student,
      studentName: usr.name || c.student,
      topic: regKltn.topicName || regKltn.topic || "—",
      date: c.date,
      location: c.location,
      councilStatus: c.councilStatus || "PENDING",
      finalScore: mergeCouncilFinalScore(c.finalScore, finalAvgStr, cnt > 0),
      minutesUrl: c.minutesUrl || "",
      gvhdScore: gvhdSc ? gvhdSc.score : "",
      gvpbScore: scoreBreakdown.GVPB ? scoreBreakdown.GVPB.score : "",
      chairmanScore: scoreBreakdown.CHUTICH ? scoreBreakdown.CHUTICH.score : "",
      revision: rev || null,
      submission: sub || {}
    };
  });

  return { ok: true, data: result };
}

function getSecretaryDashboard(payload) {
  var email = payload.email;
  var councils = readObjects("COUNCILS").filter(function (c) {
    return String(c.secretary || "").toLowerCase() === String(email || "").toLowerCase();
  });
  var students = readObjects("STUDENTS");
  var users = readObjects("USERS");
  var scores = readObjects("SCORES");
  var submissions = readObjects("SUBMISSIONS");

  var result = councils.map(function (c) {
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(c.student || "").toLowerCase(); }) || {};
    var stScores = scores.filter(function (s) { return String(s.student || "").toLowerCase() === String(c.student || "").toLowerCase() && s.type === "KLTN"; });
    var sub = submissions.find(function (s) { return String(s.student || "").toLowerCase() === String(c.student || "").toLowerCase() && s.type === "KLTN"; });

    var scoreBreakdown = {};
    stScores.forEach(function (s) {
      var rk = normalizeScoreRoleKey(s.role);
      var e = enrichScoreRow(s);
      scoreBreakdown[rk] = { score: e.score, comment: e.comment, rubric: e.rubric };
    });

    var finalAvg = 0, cnt = 0;
    stScores.forEach(function (s) {
      var e = enrichScoreRow(s);
      if (e.score && !isNaN(Number(e.score))) { finalAvg += Number(e.score); cnt++; }
    });
    var finalAvgStr = cnt > 0 ? (finalAvg / cnt).toFixed(2) : "";

    return {
      student: c.student,
      studentName: usr.name || c.student,
      date: c.date,
      location: c.location,
      councilStatus: c.councilStatus || "PENDING",
      finalScore: mergeCouncilFinalScore(c.finalScore, finalAvgStr, cnt > 0),
      minutesUrl: c.minutesUrl || "",
      scores: scoreBreakdown,
      submission: sub || {}
    };
  });

  return { ok: true, data: result };
}

function getStatistics(payload) {
  var regs = readObjects("REGISTRATIONS");
  var submissions = readObjects("SUBMISSIONS");
  var scores = readObjects("SCORES");
  var revisions = readObjects("REVISIONS");
  var students = readObjects("STUDENTS");
  var periods = readObjects("PERIODS").filter(function (p) { return p.status === "ACTIVE"; });

  var byDot = {};
  regs.forEach(function (r) {
    var dot = r.dot || "Unknown";
    if (!byDot[dot]) byDot[dot] = { total: 0, BCTT: 0, KLTN: 0, approved: 0, pending: 0 };
    byDot[dot].total++;
    if (r.type === "BCTT") byDot[dot].BCTT++;
    if (r.type === "KLTN") byDot[dot].KLTN++;
    if (r.status === "APPROVED") byDot[dot].approved++;
    if (r.status === "PENDING") byDot[dot].pending++;
  });

  // Điểm TB: trung bình theo sinh viên (SUBMISSIONS KLTN), không trung bình theo từng dòng SCORES (tránh đếm trùng vai trò).
  var kltnSubs = submissions.filter(function (s) {
    return s.type === "KLTN" && s.score !== undefined && s.score !== null && String(s.score).trim() !== "" && !isNaN(Number(s.score));
  });
  var avgScore = 0;
  if (kltnSubs.length > 0) {
    var sumSub = kltnSubs.reduce(function (acc, s) { return acc + Number(s.score); }, 0);
    avgScore = (sumSub / kltnSubs.length).toFixed(2);
  }

  var avgKltnByDot = {};
  kltnSubs.forEach(function (s) {
    var reg = regs.find(function (r) {
      return String(r.student || "").toLowerCase() === String(s.student || "").toLowerCase() && r.type === "KLTN";
    });
    var dot = reg && reg.dot ? reg.dot : "Unknown";
    if (!avgKltnByDot[dot]) avgKltnByDot[dot] = { sum: 0, n: 0 };
    avgKltnByDot[dot].sum += Number(s.score);
    avgKltnByDot[dot].n++;
  });
  var avgKltnByDotOut = {};
  Object.keys(avgKltnByDot).forEach(function (d) {
    var x = avgKltnByDot[d];
    avgKltnByDotOut[d] = x.n > 0 ? (x.sum / x.n).toFixed(2) : "0";
  });

  var kltnScores = scores.filter(function (s) { return s.type === "KLTN" && s.score && !isNaN(Number(s.score)); });

  var revisionStats = {
    total: revisions.length,
    pending: revisions.filter(function (r) { return r.gvhdApproval === "PENDING" || r.chairmanApproval === "PENDING"; }).length,
    gvhdApproved: revisions.filter(function (r) { return r.gvhdApproval === "YES"; }).length,
    chairmanApproved: revisions.filter(function (r) { return r.chairmanApproval === "YES"; }).length
  };

  return {
    ok: true,
    data: {
      byDot: byDot,
      avgScore: avgScore,
      avgKltnByDot: avgKltnByDotOut,
      revisionStats: revisionStats,
      periods: periods,
      kltnScores: kltnScores.map(enrichScoreRow)
    }
  };
}

function openLecturerSlots(payload) {
  writeAuditLog(payload.role || "TBM", payload.by || "TBM", "OPEN_SLOTS", "-", "Open registration slots");
  return { ok: true, message: "Da mo slot dang ky" };
}

function approveRegistrationsBulk(payload) {
  var ids = payload.ids || [];
  var newStatus = payload.status || "APPROVED";
  var hc = getHeaderColumnMap("REGISTRATIONS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet REGISTRATIONS" };
  var idIdx = hc.map["id"];
  var statusIdx = hc.map["status"];
  var studentIdx = hc.map["student"];
  var typeIdx = hc.map["type"];
  var approvedAtIdx = hc.map["approvedat"] !== undefined ? hc.map["approvedat"] : -1;
  var lecturerIdx = hc.map["lecturer"];
  if (idIdx === undefined || statusIdx === undefined || studentIdx === undefined || typeIdx === undefined) {
    return { ok: false, message: "Sheet REGISTRATIONS thieu cot bat buoc (id/status/student/type)" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    var rowId = hc.values[i][idIdx];
    if (ids.indexOf(rowId) !== -1 || ids.indexOf(String(rowId)) !== -1) {
      hc.sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (approvedAtIdx >= 0) {
        hc.sheet.getRange(i + 1, approvedAtIdx + 1).setValue(new Date().toISOString());
      }
      if (newStatus === "APPROVED") {
        var studentEmail = hc.values[i][studentIdx];
        var regType = hc.values[i][typeIdx];
        var newStudentStatus = regType === "BCTT" ? "BCTT_APPROVED" : "KLTN_APPROVED";
        updateStudentStatus(studentEmail, newStudentStatus);
        if (lecturerIdx !== undefined) {
          var lec = hc.values[i][lecturerIdx];
          if (lec) {
            if (regType === "BCTT") patchStudentRowByEmail(studentEmail, { bcttLecturer: lec });
            else if (regType === "KLTN") patchStudentRowByEmail(studentEmail, { kltnLecturer: lec });
          }
        }
      }
    }
  }

  writeAuditLog(payload.role || "TBM", payload.by || "TBM", "BULK_UPDATE_REGISTRATIONS", String(ids.length), newStatus);
  return { ok: true, message: "Cap nhat " + ids.length + " dang ky thanh cong" };
}

function updateRegistrationStatus(payload) {
  if (!payload.id) return { ok: false, message: "Missing registration id" };

  var hc = getHeaderColumnMap("REGISTRATIONS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet REGISTRATIONS" };
  var idIdx = hc.map["id"];
  var statusIdx = hc.map["status"];
  var studentIdx = hc.map["student"];
  var typeIdx = hc.map["type"];
  var approvedAtIdx = hc.map["approvedat"] !== undefined ? hc.map["approvedat"] : -1;
  var lecturerIdx = hc.map["lecturer"];
  if (idIdx === undefined || statusIdx === undefined || studentIdx === undefined || typeIdx === undefined) {
    return { ok: false, message: "Sheet REGISTRATIONS thieu cot bat buoc" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    var rowId = hc.values[i][idIdx];
    if (rowId === payload.id || String(rowId) === String(payload.id)) {
      hc.sheet.getRange(i + 1, statusIdx + 1).setValue(payload.status);
      if (approvedAtIdx >= 0) {
        hc.sheet.getRange(i + 1, approvedAtIdx + 1).setValue(new Date().toISOString());
      }
      var studentEmail = hc.values[i][studentIdx];
      var regType = hc.values[i][typeIdx];
      if (payload.status === "APPROVED") {
        var newStudentStatus = regType === "BCTT" ? "BCTT_APPROVED" : "KLTN_APPROVED";
        updateStudentStatus(studentEmail, newStudentStatus);
        if (lecturerIdx !== undefined) {
          var lec2 = hc.values[i][lecturerIdx];
          if (lec2) {
            if (regType === "BCTT") patchStudentRowByEmail(studentEmail, { bcttLecturer: lec2 });
            else if (regType === "KLTN") patchStudentRowByEmail(studentEmail, { kltnLecturer: lec2 });
          }
        }
      }
      writeAuditLog(payload.role || "TBM", payload.by || "TBM", "UPDATE_REGISTRATION_STATUS", payload.id, payload.status);
      return { ok: true, message: "Cap nhat trang thai thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay dang ky" };
}

function assignCouncil(payload) {
  var studentEmail = String(payload.student || "").trim();
  var regsAll = readObjects("REGISTRATIONS");
  var kltnReg = regsAll.find(function (r) {
    return String(r.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && String(r.type || "").toUpperCase() === "KLTN";
  });
  if (!kltnReg) {
    return { ok: false, message: "Hoi dong chi ap dung cho KLTN. Sinh vien chua co dang ky KLTN." };
  }
  if (String(kltnReg.status || "").toUpperCase() !== "APPROVED") {
    return { ok: false, message: "Can duyet dang ky KLTN truoc khi phan cong hoi dong." };
  }

  var hc = getHeaderColumnMap("COUNCILS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet COUNCILS" };
  var stCol = hc.map["student"];
  if (stCol === undefined) return { ok: false, message: "Thieu cot student trong COUNCILS" };

  function setCell(rowIdx, colName, val) {
    var col = hc.map[colName];
    if (col !== undefined && val !== undefined) hc.sheet.getRange(rowIdx, col + 1).setValue(val);
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][stCol] || "").toLowerCase() === String(studentEmail || "").toLowerCase()) {
      setCell(i + 1, "gvhd", payload.gvhd || "");
      setCell(i + 1, "gvpb", payload.gvpb || "");
      setCell(i + 1, "chairman", payload.chairman || "");
      setCell(i + 1, "secretary", payload.secretary || "");
      setCell(i + 1, "date", payload.date || "");
      setCell(i + 1, "location", payload.location || "");
      if (payload.minutesUrl !== undefined) setCell(i + 1, "minutesurl", payload.minutesUrl || "");
      writeAuditLog(payload.role || "TBM", payload.by || "TBM", "ASSIGN_COUNCIL", studentEmail, "Updated council");
      return { ok: true, message: "Cap nhat hoi dong thanh cong" };
    }
  }

  appendRow("COUNCILS", [studentEmail, payload.gvhd || "", payload.gvpb || "", payload.chairman || "", payload.secretary || "", payload.date || "", payload.location || "", "PENDING", "", payload.minutesUrl || ""]);
  writeAuditLog(payload.role || "TBM", payload.by || "TBM", "ASSIGN_COUNCIL", studentEmail, "Created council");
  return { ok: true, message: "Tao hoi dong thanh cong" };
}

function updateCouncilStatus(payload) {
  var studentEmail = String(payload.student || "").trim();
  var status = payload.status || "DEFENDED";
  var finalScore = payload.finalScore || "";

  var hc = getHeaderColumnMap("COUNCILS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet COUNCILS" };
  var stCol = hc.map["student"];
  var statusCol = hc.map["councilstatus"];
  var scoreCol = hc.map["finalscore"];
  if (stCol === undefined) return { ok: false, message: "Thieu cot student trong COUNCILS" };

  var want = studentEmail.toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    var rowEmail = String(hc.values[i][stCol] || "").trim().toLowerCase();
    if (rowEmail === want) {
      var rowNum = i + 1;
      if (statusCol !== undefined) hc.sheet.getRange(rowNum, statusCol + 1).setValue(status);
      if (scoreCol !== undefined && finalScore) hc.sheet.getRange(rowNum, scoreCol + 1).setValue(finalScore);
      if (String(status || "").toUpperCase() === "DEFENDED") {
        updateStudentStatus(studentEmail, "DEFENDED");
      }
      writeAuditLog(payload.role || "THUKY", payload.by || "thuky", "UPDATE_COUNCIL_STATUS", studentEmail, status);
      return { ok: true, message: "Cap nhat trang thai hoi dong" };
    }
  }
  return { ok: false, message: "Khong tim thay hoi dong" };
}

function saveFinalScore(payload) {
  var studentEmail = String(payload.student || "").trim();
  var finalScore = payload.finalScore;

  var hc = getHeaderColumnMap("COUNCILS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet COUNCILS" };
  var stCol = hc.map["student"];
  var scoreCol = hc.map["finalscore"];
  var statusCol = hc.map["councilstatus"];
  if (stCol === undefined) return { ok: false, message: "Thieu cot student trong COUNCILS" };

  var want = studentEmail.toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    var rowEmail = String(hc.values[i][stCol] || "").trim().toLowerCase();
    if (rowEmail === want) {
      var rowNum = i + 1;
      if (scoreCol !== undefined) hc.sheet.getRange(rowNum, scoreCol + 1).setValue(finalScore);
      if (statusCol !== undefined) hc.sheet.getRange(rowNum, statusCol + 1).setValue("DEFENDED");
      updateStudentStatus(studentEmail, "DEFENDED");
      writeAuditLog(payload.role || "THUKY", payload.by || "thuky", "SAVE_FINAL_SCORE", studentEmail, finalScore);
      return { ok: true, message: "Luu diem cuoi cung" };
    }
  }
  return { ok: false, message: "Khong tim thay hoi dong" };
}

function saveCouncilMinutesUrl(payload) {
  var studentEmail = String(payload.student || "").trim();
  var minutesUrl = payload.minutesUrl || "";
  var hc = getHeaderColumnMap("COUNCILS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet COUNCILS" };
  var stCol = hc.map["student"];
  var urlCol = hc.map["minutesurl"];
  if (stCol === undefined) return { ok: false, message: "Thieu cot student" };
  if (urlCol === undefined) {
    return { ok: false, message: "Sheet COUNCILS chua co cot minutesUrl. Them cot minutesUrl (link bien ban hop HD) vao hang tieu de." };
  }
  var want = studentEmail.toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    var rowEmail = String(hc.values[i][stCol] || "").trim().toLowerCase();
    if (rowEmail === want) {
      hc.sheet.getRange(i + 1, urlCol + 1).setValue(minutesUrl);
      writeAuditLog(payload.role || "THUKY", payload.by || "thuky", "SAVE_COUNCIL_MINUTES_URL", studentEmail, "URL updated");
      return { ok: true, message: "Cap nhat link bien ban thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay hoi dong" };
}

function uploadPdfFile(payload) {
  if (!payload.base64 && !payload.fileUrl) {
    return { ok: false, message: "Missing file content" };
  }

  var fileUrl = payload.fileUrl || "";
  if (!fileUrl && payload.base64) {
    try {
      var bytes = Utilities.base64Decode(payload.base64);
      var name = payload.fileName || ("submission-" + new Date().getTime() + ".pdf");
      var blob = Utilities.newBlob(bytes, payload.mimeType || "application/pdf", name);
      var file = DriveApp.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    } catch (err) {
      return { ok: false, message: "Loi upload file: " + err.message };
    }
  }

  writeAuditLog(payload.role || "SV", payload.by || "unknown", "UPLOAD_PDF", name || "file", fileUrl);
  return { ok: true, data: { fileUrl: fileUrl, fileName: payload.fileName || "file.pdf" } };
}

function getAuditLogs(payload) {
  var limit = Number(payload.limit || 200);
  var rows = readObjects("AUDIT_LOGS");
  return { ok: true, data: rows.slice(-limit).reverse() };
}

function getStudentTimeline(payload) {
  var email = payload.email;
  if (!email) return { ok: false, message: "Missing student email" };

  var regs = readObjects("REGISTRATIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var subs = readObjects("SUBMISSIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var councils = readObjects("COUNCILS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var revisions = readObjects("REVISIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var scoresRaw = readObjects("SCORES").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var scoresEnriched = dedupeEnrichedScoresByTypeRole(scoresRaw.map(enrichScoreRow));
  var periods = readObjects("PERIODS").filter(function (p) { return p.status === "ACTIVE"; });
  var students = readObjects("STUDENTS").filter(function (s) { return String(s.email || "").toLowerCase() === String(email || "").toLowerCase(); });
  var internshipForms = readObjects("INTERNSHIP_FORMS").filter(function (f) { return String(f.student || "").toLowerCase() === String(email || "").toLowerCase(); });

  var timeline = [];
  timeline.push({ key: "ACCOUNT", label: "Tai khoan khoi tao", status: "DONE", desc: "Tai khoan da duoc tao" });

  regs.forEach(function (r) {
    var statusLabel = r.status === "APPROVED" ? "Da duyet" : r.status === "REJECTED" ? "Da tu choi" : "Cho duyet";
    timeline.push({
      key: "REG_" + r.id,
      label: "Dang ky " + r.type + ": " + (r.topicName || r.topic),
      status: r.status === "APPROVED" ? "DONE" : r.status === "PENDING" ? "PENDING" : "REJECTED",
      desc: "GVHD: " + (r.lecturer || "—") + " | Dot: " + (r.dot || "—"),
      dot: r.dot,
      lecturer: r.lecturer,
      type: r.type
    });
  });

  function timelineScoreForSubmission(sub) {
    if (!sub) return "";
    if (sub.type === "PHIEU_TT") return "";
    if (sub.type === "BCTT") {
      var b = null;
      for (var bi = 0; bi < scoresEnriched.length; bi++) {
        var bx = scoresEnriched[bi];
        if (bx.type === "BCTT" && normalizeScoreRoleKey(bx.role) === "GVHD") {
          b = bx;
          break;
        }
      }
      if (b && b.score) return String(b.score);
      return (sub.score != null && String(sub.score).trim() !== "") ? String(sub.score) : "";
    }
    if (sub.type === "KLTN") {
      var c0 = councils[0];
      if (c0 && c0.finalScore != null && String(c0.finalScore).trim() !== "" && !isNaN(Number(c0.finalScore)) && Number(c0.finalScore) > 0) {
        return String(Number(Number(c0.finalScore).toFixed(2)));
      }
      if (sub.score != null && String(sub.score).trim() !== "") return String(sub.score);
      var nums = [];
      for (var ki = 0; ki < scoresEnriched.length; ki++) {
        var kx = scoresEnriched[ki];
        if (kx.type !== "KLTN") continue;
        var rkk = normalizeScoreRoleKey(kx.role);
        if (rkk !== "GVHD" && rkk !== "GVPB" && rkk !== "CHUTICH") continue;
        var kn = Number(kx.score);
        if (!isNaN(kn)) nums.push(kn);
      }
      if (nums.length > 0) {
        var sm = 0;
        for (var kj = 0; kj < nums.length; kj++) sm += nums[kj];
        return (sm / nums.length).toFixed(2);
      }
      return "";
    }
    return (sub.score != null && String(sub.score).trim() !== "") ? String(sub.score) : "";
  }

  subs.forEach(function (s) {
    var disp = timelineScoreForSubmission(s);
    var descLine = s.type === "PHIEU_TT"
      ? (s.file ? "Da nop phieu xac nhan" : "Chua nop")
      : ("Diem: " + (disp || "Chua cham"));
    timeline.push({
      key: "SUB_" + s.type,
      label: "Nop file " + s.type,
      status: s.file ? "DONE" : "PENDING",
      desc: descLine,
      score: disp || s.score,
      file: s.file,
      turnitin: s.turnitin,
      gvhdApproval: s.gvhdApproval
    });
  });

  internshipForms.forEach(function (f) {
    timeline.push({
      key: "INTERNSHIP",
      label: "Phieu xac nhan thuc tap",
      status: f.file ? "DONE" : "PENDING",
      desc: f.file ? "Da upload" : "Chua upload"
    });
  });

  councils.forEach(function (c) {
    timeline.push({
      key: "COUNCIL",
      label: "Hoi dong bao ve",
      status: c.councilStatus === "DEFENDED" ? "DONE" : c.councilStatus === "PENDING" ? "PENDING" : "WAITING",
      desc: "Ngay: " + (c.date || "—") + " | Dia diem: " + (c.location || "—"),
      date: c.date,
      location: c.location,
      finalScore: c.finalScore,
      gvhd: c.gvhd,
      gvpb: c.gvpb,
      chairman: c.chairman
    });
  });

  revisions.forEach(function (r) {
    timeline.push({
      key: "REVISION",
      label: "Bai chinh sua sau bao ve",
      status: r.finalStatus === "APPROVED" ? "DONE" : r.gvhdApproval === "YES" ? "PARTIAL" : "PENDING",
      desc: "GVHD: " + (r.gvhdApproval || "—") + " | Chu tich: " + (r.chairmanApproval || "—"),
      kltnFile: r.kltnFile,
      revisionNote: r.revisionNote
    });
  });

  scoresEnriched.forEach(function (s) {
    var note = s.comment ? s.comment.substring(0, 80) : "";
    timeline.push({
      key: "SCORE_" + s.role + "_" + s.type,
      label: "Diem " + s.type + " (" + s.role + ")",
      status: s.score ? "DONE" : "PENDING",
      desc: "Diem: " + (s.score || "Chua cham") + (note ? " | Nhan xet: " + note : ""),
      score: s.score,
      comment: s.comment,
      role: s.role
    });
  });

  return { ok: true, data: { timeline: timeline, periods: periods, student: students[0] || null } };
}

/** Tim dung hang header (giong readObjects) va map ten cot -> index de ghi sheet an toan. */
function getHeaderColumnMap(sheetName) {
  try {
    var sh = getSheet(sheetName);
    var values = sh.getDataRange().getValues();
    if (!values.length) return null;
    var configuredHeaders = (CONFIG.SHEETS && CONFIG.SHEETS[sheetName]) ? CONFIG.SHEETS[sheetName] : null;
    var headerRowIdx = 0;
    if (configuredHeaders && configuredHeaders.length) {
      var expected = configuredHeaders.map(function (h) { return String(h || "").trim().toLowerCase(); });
      for (var r = 0; r < Math.min(10, values.length); r++) {
        var normalized = values[r].map(function (c) { return String(c || "").trim().toLowerCase(); });
        var score = 0;
        expected.forEach(function (h) { if (h && normalized.indexOf(h) !== -1) score++; });
        if (score >= 2) {
          headerRowIdx = r;
          break;
        }
      }
    }
    var headerCells = values[headerRowIdx] || [];
    var map = {};
    for (var c = 0; c < headerCells.length; c++) {
      var key = String(headerCells[c] || "").trim().toLowerCase();
      if (key && map[key] === undefined) map[key] = c;
    }
    return { sheet: sh, values: values, headerRowIdx: headerRowIdx, map: map };
  } catch (e) {
    return null;
  }
}

function getAllUsers(payload) {
  var users = readObjects("USERS");
  var students = readObjects("STUDENTS");
  return { ok: true, data: users };
}

function approveUser(payload) {
  var email = payload.email;
  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  var statusCol = hc.map["status"];
  if (emailCol === undefined || statusCol === undefined) {
    return { ok: false, message: "Khong tim thay cot email/status trong sheet USERS" };
  }
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, statusCol + 1).setValue("APPROVED");
      writeAuditLog(payload.role || "ADMIN", payload.by || "admin", "APPROVE_USER", email, "User approved");
      return { ok: true, message: "Duyet tai khoan thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay tai khoan" };
}

function rejectUser(payload) {
  var email = payload.email;
  var reason = payload.reason || "";
  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  var statusCol = hc.map["status"];
  if (emailCol === undefined || statusCol === undefined) {
    return { ok: false, message: "Khong tim thay cot email/status trong sheet USERS" };
  }
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, statusCol + 1).setValue("REJECTED");
      writeAuditLog(payload.role || "ADMIN", payload.by || "admin", "REJECT_USER", email, "Rejected: " + reason);
      return { ok: true, message: "Tu choi tai khoan" };
    }
  }
  return { ok: false, message: "Khong tim thay tai khoan" };
}

function updateUserProfile(payload) {
  if (!spreadsheetConfigured()) {
    return { ok: false, message: "Chua cau hinh SPREADSHEET_ID trong Code.gs (Google Apps Script)." };
  }
  var email = payload.email;
  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  if (emailCol === undefined) return { ok: false, message: "Thieu cot email trong sheet USERS" };

  var fields = ["name", "phone", "major", "mssv", "trainingSystem"];
  var mssvVal = payload.mssv !== undefined ? payload.mssv : payload.studentId;
  var trainingSystemVal = payload.trainingSystem !== undefined ? payload.trainingSystem : payload.heDaoTao;

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      fields.forEach(function (f) {
        var col = hc.map[f];
        if (col !== undefined && payload[f] !== undefined) {
          hc.sheet.getRange(i + 1, col + 1).setValue(payload[f]);
        }
      });
      if (trainingSystemVal !== undefined && hc.map["trainingsystem"] !== undefined) {
        hc.sheet.getRange(i + 1, hc.map["trainingsystem"] + 1).setValue(trainingSystemVal);
      }
      if (mssvVal !== undefined && hc.map["mssv"] !== undefined) {
        hc.sheet.getRange(i + 1, hc.map["mssv"] + 1).setValue(mssvVal);
      }
      writeAuditLog(payload.role || "ADMIN", payload.by || "admin", "UPDATE_USER_PROFILE", email, "Profile updated");
      return { ok: true, message: "Cap nhat thong tin thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay tai khoan" };
}

function changePassword(payload) {
  if (!spreadsheetConfigured()) {
    return { ok: false, message: "Chua cau hinh SPREADSHEET_ID trong Code.gs (Google Apps Script)." };
  }
  var loginEmail = String(payload.email || "").trim().toLowerCase();
  var oldPw = String(payload.oldPassword || "").trim();
  var newPw = String(payload.newPassword || "").trim();
  if (newPw.length < 6) return { ok: false, message: "Mat khau moi phai it nhat 6 ky tu" };

  var users = readObjects("USERS");
  var u = users.find(function (x) { return String(x.email || "").toLowerCase() === loginEmail; });
  if (!u) return { ok: false, message: "Khong tim thay tai khoan" };
  if (String(u.password || "").trim() !== oldPw) return { ok: false, message: "Mat khau cu khong dung" };

  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  var passCol = hc.map["password"];
  if (emailCol === undefined || passCol === undefined) {
    return { ok: false, message: "Thieu cot email/password trong sheet USERS" };
  }
  for (var j = hc.headerRowIdx + 1; j < hc.values.length; j++) {
    if (String(hc.values[j][emailCol] || "").toLowerCase() === loginEmail) {
      hc.sheet.getRange(j + 1, passCol + 1).setValue(newPw);
      writeAuditLog(String(u.role || "SV"), u.email, "CHANGE_PASSWORD", u.email, "Password changed");
      return { ok: true, message: "Doi mat khau thanh cong" };
    }
  }
  return { ok: false, message: "Khong cap nhat duoc mat khau" };
}

function changeUserRole(payload) {
  var email = payload.email;
  var newRole = payload.role;

  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  var roleCol = hc.map["role"];
  if (emailCol === undefined || roleCol === undefined) {
    return { ok: false, message: "Khong tim thay cot email/role trong sheet USERS" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, roleCol + 1).setValue(newRole);
      writeAuditLog(payload.actorRole || "ADMIN", payload.by || "admin", "CHANGE_ROLE", email, "Changed to " + newRole);
      return { ok: true, message: "Doi vai tro thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay tai khoan" };
}

function deactivateUser(payload) {
  var email = payload.email;
  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  var statusCol = hc.map["status"];
  if (emailCol === undefined || statusCol === undefined) {
    return { ok: false, message: "Khong tim thay cot email/status trong sheet USERS" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, statusCol + 1).setValue("INACTIVE");
      writeAuditLog(payload.role || "ADMIN", payload.by || "admin", "DEACTIVATE_USER", email, "User deactivated");
      return { ok: true, message: "Khoa tai khoan thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay tai khoan" };
}

function activateUser(payload) {
  var email = payload.email;
  var hc = getHeaderColumnMap("USERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet USERS" };
  var emailCol = hc.map["email"];
  var statusCol = hc.map["status"];
  if (emailCol === undefined || statusCol === undefined) {
    return { ok: false, message: "Khong tim thay cot email/status trong sheet USERS" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, statusCol + 1).setValue("APPROVED");
      writeAuditLog(payload.role || "ADMIN", payload.by || "admin", "ACTIVATE_USER", email, "User activated");
      return { ok: true, message: "Kich hoat tai khoan thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay tai khoan" };
}

function updateLecturerQuota(payload) {
  var email = payload.email;
  var quota = Number(payload.quota) || 0;
  var actorEmail = String(payload.actorEmail || "").trim().toLowerCase();
  if (actorEmail) {
    var usersQ = readObjects("USERS");
    var actorQ = usersQ.find(function (u) { return String(u.email || "").toLowerCase() === actorEmail; });
    if (actorQ && String(actorQ.role || "").toUpperCase() === "TBM" && String(actorQ.major || "").trim()) {
      var allLec = readObjects("LECTURERS");
      var targetLec = allLec.find(function (x) { return String(x.email || "").toLowerCase() === String(email || "").toLowerCase(); });
      if (!targetLec || !lecturerBelongsToTbmMajor(targetLec.majors, actorQ.major)) {
        return { ok: false, message: "Chi duoc cap nhat quota giang vien cung chuyen nganh bo mon cua ban" };
      }
    }
  }

  var hc = getHeaderColumnMap("LECTURERS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet LECTURERS" };
  var emailCol = hc.map["email"];
  var quotaCol = hc.map["quota"];
  if (emailCol === undefined || quotaCol === undefined) {
    return { ok: false, message: "Khong tim thay cot email/quota trong sheet LECTURERS" };
  }

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, quotaCol + 1).setValue(quota);
      writeAuditLog(payload.role || "TBM", payload.by || "tbm", "UPDATE_LECTURER_QUOTA", email, "Quota changed to " + quota);
      return { ok: true, message: "Cap nhat quota thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay giang vien" };
}

function sendCouncilNotification(payload) {
  writeAuditLog(payload.role || "TBM", payload.by || "tbm", "SEND_COUNCIL_NOTIFICATION", payload.student, "Notification sent");
  return { ok: true, message: "Gui thong bao thanh cong (mock)" };
}

function getTopicSuggestions(payload) {
  var email = payload.email;
  var field = payload.field;

  var suggestions = readObjects("TOPIC_SUGGESTIONS").filter(function (t) {
    if (t.status !== "APPROVED") return false;
    if (field && field !== "ALL") {
      return String(t.field || "").toLowerCase() === String(field || "").toLowerCase();
    }
    return true;
  });

  var lecturers = readObjects("LECTURERS");
  var users = readObjects("USERS");

  suggestions = suggestions.map(function (s) {
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(s.lecturer || "").toLowerCase(); }) || {};
    return { id: s.id, name: s.name, field: s.field, description: s.description, lecturer: s.lecturer, lecturerName: usr.name || s.lecturer };
  });

  if (email) {
    var mySuggestions = readObjects("TOPIC_SUGGESTIONS").filter(function (t) { return String(t.lecturer || "").toLowerCase() === String(email || "").toLowerCase(); });
    var allSuggestions = mySuggestions.map(function (s) {
      var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(s.lecturer || "").toLowerCase(); }) || {};
      return { id: s.id, name: s.name, field: s.field, description: s.description, status: s.status, lecturer: s.lecturer, lecturerName: usr.name || s.lecturer };
    });
    return { ok: true, data: { suggestions: suggestions, mySuggestions: allSuggestions } };
  }

  return { ok: true, data: { suggestions: suggestions } };
}

function createTopicSuggestion(payload) {
  var id = "ts-" + Utilities.getUuid().substring(0, 8);
  var now = new Date().toISOString();
  appendRow("TOPIC_SUGGESTIONS", [id, payload.lecturer, payload.name, payload.field, payload.description || "", "APPROVED", now]);
  writeAuditLog(payload.role || "GV", payload.lecturer, "CREATE_TOPIC_SUGGESTION", id, payload.name);
  return { ok: true, data: { id: id } };
}

function approveTopicSuggestion(payload) {
  var id = payload.id;
  var status = payload.status || "APPROVED";

  var sh = getSheet("TOPIC_SUGGESTIONS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var idIdx = headers.indexOf("id");
  var statusIdx = headers.indexOf("status");

  for (var i = 1; i < values.length; i++) {
    if (values[i][idIdx] === id) {
      sh.getRange(i + 1, statusIdx + 1).setValue(status);
      writeAuditLog(payload.role || "TBM", payload.by || "tbm", "APPROVE_TOPIC_SUGGESTION", id, status);
      return { ok: true, message: "Cap nhat trang thai goi y de tai" };
    }
  }
  return { ok: false, message: "Khong tim thay goi y" };
}

function getPeriods(payload) {
  var periods = readObjects("PERIODS");
  return { ok: true, data: periods };
}

function savePeriod(payload) {
  var id = payload.id || "p-" + Utilities.getUuid().substring(0, 8);
  var periods = readObjects("PERIODS");
  var sh = getSheet("PERIODS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var idIdx = headers.indexOf("id");

  for (var i = 1; i < values.length; i++) {
    if (values[i][idIdx] === id) {
      var cols = ["name", "bcttDeadline", "kltnDeadline", "revisionDeadline", "status"];
      cols.forEach(function (col, j) {
        var idx = headers.indexOf(col);
        if (idx >= 0 && payload[col] !== undefined) {
          sh.getRange(i + 1, idx + 1).setValue(payload[col]);
        }
      });
      writeAuditLog(payload.role || "TBM", payload.by || "tbm", "SAVE_PERIOD", id, "Period updated");
      return { ok: true };
    }
  }

  appendRow("PERIODS", [id, payload.name || "", payload.bcttDeadline || "", payload.kltnDeadline || "", payload.revisionDeadline || "", payload.status || "ACTIVE"]);
  writeAuditLog(payload.role || "TBM", payload.by || "tbm", "SAVE_PERIOD", id, "Period created");
  return { ok: true };
}

function getRevisionStatus(payload) {
  var email = payload.email;
  var revisions = readObjects("REVISIONS").filter(function (r) { return String(r.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  return { ok: true, data: revisions[0] || null };
}

function submitRevision(payload) {
  var studentEmail = payload.student;
  var kltnFile = payload.kltnFile || "";
  var revisionNote = payload.revisionNote || "";
  var now = new Date().toISOString();

  if (!studentMaySubmitKltnRevision(studentEmail)) {
    return { ok: false, message: "Chi duoc nop bai chinh sua sau khi hoi dong da bao ve (DEFENDED)." };
  }

  var revisions = readObjects("REVISIONS");
  var existing = revisions.find(function (r) { return String(r.student || "").toLowerCase() === String(studentEmail || "").toLowerCase(); });

  if (existing) {
    updateRevision(studentEmail, kltnFile, revisionNote, now);
  } else {
    var id = "rev-" + Utilities.getUuid().substring(0, 8);
    appendRow("REVISIONS", [id, studentEmail, kltnFile, revisionNote, now, "PENDING", "", "PENDING", "", ""]);
  }

  writeAuditLog("SV", studentEmail, "SUBMIT_REVISION", studentEmail, "Revision submitted");
  return { ok: true, message: "Nop bai chinh sua thanh cong" };
}

function approveRevisionGVHD(payload) {
  var studentEmail = String(payload.student || "").trim();
  var approval = payload.approval || "YES";
  var now = new Date().toISOString();

  var hc = getHeaderColumnMap("REVISIONS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet REVISIONS" };
  var studentCol = hc.map["student"];
  var approvalCol = hc.map["gvhdapproval"];
  var dateCol = hc.map["gvhdapprovaldate"];
  if (studentCol === undefined) return { ok: false, message: "Sheet REVISIONS thieu cot student" };

  var want = studentEmail.toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][studentCol] || "").trim().toLowerCase() === want) {
      if (approvalCol !== undefined) hc.sheet.getRange(i + 1, approvalCol + 1).setValue(approval);
      if (dateCol !== undefined) hc.sheet.getRange(i + 1, dateCol + 1).setValue(now);
      writeAuditLog("GV", payload.by || "gvhd", "APPROVE_REVISION_GVHD", studentEmail, approval);
      return { ok: true, message: "GVHD da " + (approval === "YES" ? "dong y" : "khong dong y") + " chinh sua" };
    }
  }
  return { ok: false, message: "Khong tim thay bai chinh sua" };
}

function approveRevisionChairman(payload) {
  var studentEmail = String(payload.student || "").trim();
  var approval = payload.approval || "YES";
  var now = new Date().toISOString();

  var hc = getHeaderColumnMap("REVISIONS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet REVISIONS" };
  var studentCol = hc.map["student"];
  var approvalCol = hc.map["chairmanapproval"];
  var dateCol = hc.map["chairmanapprovaldate"];
  var finalCol = hc.map["finalstatus"];
  if (studentCol === undefined) return { ok: false, message: "Sheet REVISIONS thieu cot student" };

  var want = studentEmail.toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][studentCol] || "").trim().toLowerCase() === want) {
      if (approvalCol !== undefined) hc.sheet.getRange(i + 1, approvalCol + 1).setValue(approval);
      if (dateCol !== undefined) hc.sheet.getRange(i + 1, dateCol + 1).setValue(now);
      if (finalCol !== undefined) hc.sheet.getRange(i + 1, finalCol + 1).setValue(approval);
      writeAuditLog("CHUTICH", payload.by || "chutich", "APPROVE_REVISION_CHAIRMAN", studentEmail, approval);
      return { ok: true, message: "Chu tich da " + (approval === "YES" ? "dong y" : "khong dong y") + " chinh sua" };
    }
  }
  return { ok: false, message: "Khong tim thay bai chinh sua" };
}

function getRevisionApprovals(payload) {
  var email = payload.email;
  var role = payload.role;

  var revisions = readObjects("REVISIONS");
  var students = readObjects("STUDENTS");
  var users = readObjects("USERS");
  var councils = readObjects("COUNCILS");

  var myRevisions = [];
  revisions.forEach(function (r) {
    var usr = users.find(function (u) { return String(u.email || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};
    var council = councils.find(function (c) { return String(c.student || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};

    var roleU = String(role || "").trim().toUpperCase();
    var isGvhdActor = roleU === "GV" || roleU === "GVHD";
    var canApproveGVHD = isGvhdActor && String(council.gvhd || "").toLowerCase() === String(email || "").toLowerCase();
    var canApproveChairman = role === "CHUTICH" && String(council.chairman || "").toLowerCase() === String(email || "").toLowerCase();

    if (canApproveGVHD || canApproveChairman) {
      myRevisions.push({
        student: r.student,
        studentName: usr.name || r.student,
        kltnFile: r.kltnFile,
        revisionNote: r.revisionNote,
        gvhdApproval: r.gvhdApproval,
        gvhdApprovalDate: r.gvhdApprovalDate,
        chairmanApproval: r.chairmanApproval,
        chairmanApprovalDate: r.chairmanApprovalDate,
        canApproveGVHD: canApproveGVHD,
        canApproveChairman: canApproveChairman
      });
    }
  });

  return { ok: true, data: myRevisions };
}

function getCouncilMinutes(payload) {
  var studentEmail = payload.student;
  var scores = readObjects("SCORES").filter(function (s) { return String(s.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && s.type === "KLTN"; });
  var regs = readObjects("REGISTRATIONS").filter(function (r) { return String(r.student || "").toLowerCase() === String(studentEmail || "").toLowerCase() && r.type === "KLTN"; });
  var users = readObjects("USERS");
  var councils = readObjects("COUNCILS");

  var reg = regs[0] || {};
  var council = councils.find(function (c) { return String(c.student || "").toLowerCase() === String(studentEmail || "").toLowerCase(); }) || {};
  var st = users.find(function (u) { return String(u.email || "").toLowerCase() === String(studentEmail || "").toLowerCase(); }) || {};

  var scoreBreakdown = {};
  scores.forEach(function (s) {
    var e = enrichScoreRow(s);
    scoreBreakdown[normalizeScoreRoleKey(s.role)] = e;
  });

  return {
    ok: true,
    data: {
      student: studentEmail,
      studentName: st.name || studentEmail,
      topic: reg.topicName || reg.topic || "",
      council: council,
      scores: scoreBreakdown
    }
  };
}

function incrementLecturerSlot(email) {
  var hc = getHeaderColumnMap("LECTURERS");
  if (!hc) return;
  var emailCol = hc.map["email"];
  var slotCol = hc.map["currentslot"];
  if (emailCol === undefined || slotCol === undefined) return;
  var em = String(email || "").toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === em) {
      var current = Number(hc.values[i][slotCol] || 0);
      hc.sheet.getRange(i + 1, slotCol + 1).setValue(current + 1);
      return;
    }
  }
}

function updateStudentStatus(email, status) {
  var hc = getHeaderColumnMap("STUDENTS");
  if (!hc) return;
  var emailCol = hc.map["email"];
  var statusCol = hc.map["status"];
  if (emailCol === undefined || statusCol === undefined) return;

  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() === String(email || "").toLowerCase()) {
      hc.sheet.getRange(i + 1, statusCol + 1).setValue(status);
      return;
    }
  }
}

/**
 * Ghi một hoặc nhiều cột trên sheet STUDENTS theo email (khớp header đa dòng như template).
 * patch: { bcttLecturer, kltnLecturer, internshipForm, status, ... } — chỉ ghi key có giá trị (không null/undefined).
 */
function patchStudentRowByEmail(email, patch) {
  if (!email || !patch || typeof patch !== "object") return;
  var hc = getHeaderColumnMap("STUDENTS");
  if (!hc) return;
  var emailCol = hc.map["email"];
  if (emailCol === undefined) return;
  var emailNorm = String(email || "").toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][emailCol] || "").toLowerCase() !== emailNorm) continue;
    var rowNum = i + 1;
    for (var k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      var val = patch[k];
      if (val === undefined || val === null) continue;
      var col = hc.map[String(k).trim().toLowerCase()];
      if (col !== undefined) hc.sheet.getRange(rowNum, col + 1).setValue(val);
    }
    return;
  }
}

function updateSubmissionRow(student, type, file, turnitin, score, submittedAt) {
  var sh = getSheet("SUBMISSIONS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");
  var typeIdx = headers.indexOf("type");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][studentIdx] || "").toLowerCase() === String(student || "").toLowerCase() && values[i][typeIdx] === type) {
      if (file) sh.getRange(i + 1, 3).setValue(file);
      if (turnitin !== undefined) sh.getRange(i + 1, 4).setValue(turnitin);
      if (score !== undefined) sh.getRange(i + 1, 5).setValue(score);
      sh.getRange(i + 1, 6).setValue(submittedAt);
      return;
    }
  }
  appendRow("SUBMISSIONS", [student, type, file || "", turnitin || "", score || "", submittedAt, "PENDING", ""]);
}

function updateSubmissionScore(student, type, avg) {
  var sh = getSheet("SUBMISSIONS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");
  var typeIdx = headers.indexOf("type");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][studentIdx] || "").toLowerCase() === String(student || "").toLowerCase() && values[i][typeIdx] === type) {
      sh.getRange(i + 1, 5).setValue(avg);
      return;
    }
  }
}

function updateInternshipForm(student, file, submittedAt) {
  var sh = getSheet("INTERNSHIP_FORMS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][studentIdx] || "").toLowerCase() === String(student || "").toLowerCase()) {
      sh.getRange(i + 1, 2).setValue(file);
      sh.getRange(i + 1, 3).setValue(submittedAt);
      return;
    }
  }
}

function updateScoreRow(id, student, type, role, score, comment, savedAt, rubricArr, rubricTotal) {
  var sh = getSheet("SCORES");
  var values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return;

  // Dò hàng tiêu đề vì sheet có thể có nhiều dòng mô tả phía trên (template).
  var expected = (CONFIG.SHEETS && CONFIG.SHEETS["SCORES"]) ? CONFIG.SHEETS["SCORES"] : null;
  var headerRowIdx = 0;
  if (expected && expected.length) {
    var expectedNorm = expected.map(function (h) { return String(h || "").trim().toLowerCase(); });
    headerRowIdx = 0;
    for (var r = 0; r < Math.min(values.length, 15); r++) {
      var row = values[r] || [];
      var norm = row.map(function (c) { return String(c || "").trim().toLowerCase(); });
      var hdrHits = 0;
      for (var e = 0; e < expectedNorm.length; e++) {
        var key = expectedNorm[e];
        if (!key) continue;
        // Nhận định "trùng" nếu cell header có chứa key.if (norm.join("|").indexOf(key) !== -1) hdrHits++;
        if (norm.join("|").indexOf(key) !== -1) hdrHits++;
      }
      if (hdrHits >= 2) {
        headerRowIdx = r;
        break;
      }
    }
  }

  var headers = values[headerRowIdx] || [];
  var normHeader = headers.map(function (c) { return String(c || "").trim().toLowerCase(); });

  function findCol(key) {
    key = String(key || "").trim().toLowerCase();
    if (!key) return -1;
    for (var i = 0; i < normHeader.length; i++) {
      if (normHeader[i] && normHeader[i].indexOf(key) !== -1) return i;
    }
    return -1;
  }

  var idIdx = findCol("id");
  var scoreIdx = findCol("score");
  var commentIdx = findCol("comment");
  var savedAtIdx = findCol("savedAt");

  // Không dò được cột id thì không thể update.
  if (idIdx === -1) return;

  for (var i = headerRowIdx + 1; i < values.length; i++) {
    if (String(values[i][idIdx] || "") !== String(id || "")) continue;

    if (score !== undefined && scoreIdx !== -1) sh.getRange(i + 1, scoreIdx + 1).setValue(score);
    if (comment !== undefined && commentIdx !== -1) sh.getRange(i + 1, commentIdx + 1).setValue(comment);
    if (savedAtIdx !== -1) sh.getRange(i + 1, savedAtIdx + 1).setValue(savedAt);

    // Cập nhật r1–r8 + rubricTotal nếu tồn tại.
    if (rubricArr && rubricArr.length) {
      for (var r = 0; r < 8; r++) {
        var colName = "r" + (r + 1);
        var idx = findCol(colName);
        if (idx !== -1) sh.getRange(i + 1, idx + 1).setValue(rubricArr[r] != null ? rubricArr[r] : "");
      }
    }
    if (rubricTotal != null) {
      var totalIdx = findCol("rubricTotal");
      if (totalIdx !== -1) sh.getRange(i + 1, totalIdx + 1).setValue(rubricTotal);
    }
    return;
  }
}

function appendScoreRowMapped(id, student, type, role, score, comment, savedAt, rubricArr, rubricTotal) {
  var sh = getSheet("SCORES");
  var values = sh.getDataRange().getValues();
  if (!values || values.length < 1) return false;

  // Dò hàng tiêu đề theo CONFIG.SHEETS["SCORES"] (sheet template có thể có nhiều dòng mô tả phía trên)
  var expected = (CONFIG.SHEETS && CONFIG.SHEETS["SCORES"]) ? CONFIG.SHEETS["SCORES"] : null;
  var headerRowIdx = 0;
  if (expected && expected.length) {
    var expectedNorm = expected.map(function (h) { return String(h || "").trim().toLowerCase(); });
    for (var r = 0; r < Math.min(values.length, 15); r++) {
      var row = values[r] || [];
      var norm = row.map(function (c) { return String(c || "").trim().toLowerCase(); });
      var scoreMatch = 0;
      for (var e = 0; e < expectedNorm.length; e++) {
        var key = expectedNorm[e];
        if (!key) continue;
        if (norm.join("|").indexOf(key) !== -1) scoreMatch++;
      }
      if (scoreMatch >= 2) {
        headerRowIdx = r;
        break;
      }
    }
  }

  var headers = values[headerRowIdx] || [];
  var normHeader = headers.map(function (c) { return String(c || "").trim().toLowerCase(); });

  function findCol(key) {
    key = String(key || "").trim().toLowerCase();
    if (!key) return -1;
    for (var i = 0; i < normHeader.length; i++) {
      if (normHeader[i] && normHeader[i].indexOf(key) !== -1) return i;
    }
    return -1;
  }

  var idIdx = findCol("id");
  var studentIdx = findCol("student");
  var typeIdx = findCol("type");
  var roleIdx = findCol("role");
  var scoreIdx = findCol("score");
  var commentIdx = findCol("comment");
  var savedAtIdx = findCol("savedAt");

  var rubricIdx = [];
  for (var r = 0; r < 8; r++) rubricIdx.push(findCol("r" + (r + 1)));
  var rubricTotalIdx = findCol("rubricTotal");

  // Xác định dòng ghi mới
  var nextRow = sh.getLastRow() + 1;
  if (nextRow <= headerRowIdx + 1) nextRow = headerRowIdx + 2;

  // Ghi theo mapping cột (nếu cột không tồn tại thì bỏ qua)
  if (idIdx !== -1) sh.getRange(nextRow, idIdx + 1).setValue(id);
  if (studentIdx !== -1) sh.getRange(nextRow, studentIdx + 1).setValue(student);
  if (typeIdx !== -1) sh.getRange(nextRow, typeIdx + 1).setValue(type);
  if (roleIdx !== -1) sh.getRange(nextRow, roleIdx + 1).setValue(role);
  if (scoreIdx !== -1) sh.getRange(nextRow, scoreIdx + 1).setValue(score);
  if (commentIdx !== -1) sh.getRange(nextRow, commentIdx + 1).setValue(comment);
  if (savedAtIdx !== -1) sh.getRange(nextRow, savedAtIdx + 1).setValue(savedAt);

  if (rubricArr && rubricArr.length) {
    for (var r = 0; r < 8; r++) {
      if (rubricIdx[r] !== -1) sh.getRange(nextRow, rubricIdx[r] + 1).setValue(rubricArr[r] != null ? rubricArr[r] : "");
    }
  }
  if (rubricTotalIdx !== -1) sh.getRange(nextRow, rubricTotalIdx + 1).setValue(rubricTotal != null ? rubricTotal : "");

  return true;
}

function updateRevision(studentEmail, kltnFile, revisionNote, submittedAt) {
  var hc = getHeaderColumnMap("REVISIONS");
  if (!hc) return;
  var studentCol = hc.map["student"];
  var kltnCol = hc.map["kltnfile"];
  var noteCol = hc.map["revisionnote"];
  var subAtCol = hc.map["submittedat"];
  var gvhdApCol = hc.map["gvhdapproval"];
  var chairApCol = hc.map["chairmanapproval"];
  var finalCol = hc.map["finalstatus"];
  if (studentCol === undefined) return;

  var want = String(studentEmail || "").trim().toLowerCase();
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][studentCol] || "").trim().toLowerCase() !== want) continue;
    var rowNum = i + 1;
    if (kltnFile && kltnCol !== undefined) hc.sheet.getRange(rowNum, kltnCol + 1).setValue(kltnFile);
    if (revisionNote && noteCol !== undefined) hc.sheet.getRange(rowNum, noteCol + 1).setValue(revisionNote);
    if (subAtCol !== undefined) hc.sheet.getRange(rowNum, subAtCol + 1).setValue(submittedAt);
    if (gvhdApCol !== undefined) hc.sheet.getRange(rowNum, gvhdApCol + 1).setValue("PENDING");
    if (chairApCol !== undefined) hc.sheet.getRange(rowNum, chairApCol + 1).setValue("PENDING");
    if (finalCol !== undefined) hc.sheet.getRange(rowNum, finalCol + 1).setValue("");
    return;
  }
}

function readObjects(sheetName) {
  try {
    var sh = getSheet(sheetName);
    var values = sh.getDataRange().getValues();
    if (values.length < 2) return [];

    // Xác định hàng tiêu đề (header) đúng vì sheet thực tế có thể có 1-2 dòng mô tả phía trên.
    var configuredHeaders = (CONFIG.SHEETS && CONFIG.SHEETS[sheetName]) ? CONFIG.SHEETS[sheetName] : null;
    var headerRowIdx = 0;
    if (configuredHeaders && configuredHeaders.length) {
      var expected = configuredHeaders.map(function (h) { return String(h || "").trim().toLowerCase(); });
      // Thử tìm trong 10 dòng đầu tiên xem có chứa đủ "email/password" (hoặc ít nhất 2 cột hợp lệ).
      for (var r = 0; r < Math.min(10, values.length); r++) {
        var normalized = values[r].map(function (c) { return String(c || "").trim().toLowerCase(); });
        var score = 0;
        expected.forEach(function (h) { if (h && normalized.indexOf(h) !== -1) score++; });
        if (score >= 2) {
          headerRowIdx = r;
          break;
        }
      }
    }

    var headerCells = values[headerRowIdx] || [];
    var normalizedHeaderCells = headerCells.map(function (c) { return String(c || "").trim().toLowerCase(); });

    // Map theo tên cột chuẩn để tránh phụ thuộc thứ tự cột.
    return values.slice(headerRowIdx + 1).filter(function (row) {
      // Bỏ các dòng trống hoàn toàn
      return row && row.some(function (c) { return String(c || "").trim() !== ""; });
    }).map(function (row) {
      var obj = {};
      if (configuredHeaders && configuredHeaders.length) {
        configuredHeaders.forEach(function (h) {
          var idx = normalizedHeaderCells.indexOf(String(h).trim().toLowerCase());
          if (idx !== -1) obj[h] = row[idx];
        });
      } else {
        // Fallback: dùng headerCells trực tiếp
        headerCells.forEach(function (h, i) { obj[h] = row[i]; });
      }
      return obj;
    });
  } catch (e) {
    return [];
  }
}

function appendRow(sheetName, row) {
  try {
    getSheet(sheetName).appendRow(row);
    return true;
  } catch (e) {
    Logger.log("Append error: " + e.message);
    return false;
  }
}

function writeAuditLog(role, actor, action, target, detail) {
  appendRow("AUDIT_LOGS", [new Date().toISOString(), role || "", actor || "", action || "", target || "", detail || ""]);
}

function writeSheetRows(sheet, rows) {
  if (!rows.length) return;
  var start = sheet.getLastRow() + 1;
  if (start <= 1) start = 2;
  sheet.getRange(start, 1, rows.length, rows[0].length).setValues(rows);
}

function clearDataRows(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow > 1 && lastCol > 0) {
      sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
    }
  } catch (e) { }
}

function getSheet(name) {
  var sh = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(name);
  if (!sh) throw new Error("Missing sheet: " + name);
  return sh;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function unique(value, index, arr) {
  return arr.indexOf(value) === index;
}
