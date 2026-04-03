// Google Sheet chinh (USERS, STUDENTS, ...): mo sheet -> URL co dang
// https://docs.google.com/spreadsheets/d/<DAY_LA_SPREADSHEET_ID>/edit
// Dien ID vao duoi, luu Code.gs, Deploy lai Web App neu can.
const CONFIG = {
  SPREADSHEET_ID: "REPLACE_WITH_YOUR_SPREADSHEET_ID",
  SOURCE_DATA_SPREADSHEET_ID: "1Klg63cEIEyCTo2zkPff6hyoR8jXV19nxBRX56qyy_tw",
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
    // SCORES: thêm các cột r1–r8 + rubricTotal để lưu từng tiêu chí chấm điểm (KLTN, BCTT, ...)
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
    // KLTN (thang 0-12) - lưu rubric vào comment JSON + r1..r8 + rubricTotal
    ["sc-01", "sv02@univ.edu.vn", "KLTN", "GVHD", 8.5, '{"v":1,"rubric":[0.75,0.75,1.25,1.25,2.0,0.75,0.75,1.0],"total":8.5,"note":"KLTN GVHD: bai lam tot, co yeu to sang tao; can hoan thien phan thuc nghiem."}', now, 0.75, 0.75, 1.25, 1.25, 2.0, 0.75, 0.75, 1.0, 8.5],
    ["sc-02", "sv02@univ.edu.vn", "KLTN", "GVPB", 8.0, '{"v":1,"rubric":[0.75,0.75,1.0,1.25,1.5,0.75,0.75,1.25],"total":8.0,"note":"KLTN GVPB: phan tich kha toan dien; co cau hoi ve scale va do chinh xac mo hinh."}', now, 0.75, 0.75, 1.0, 1.25, 1.5, 0.75, 0.75, 1.25, 8.0],
    ["sc-03", "sv02@univ.edu.vn", "KLTN", "CHUTICH", 8.5, '{"v":1,"rubric":[0.75,0.75,1.25,1.5,1.75,0.75,0.75,1.0],"total":8.5,"note":"KLTN Chu tich: trinh bay tot; tra loi duoc cau hoi phan bien."}', now, 0.75, 0.75, 1.25, 1.5, 1.75, 0.75, 0.75, 1.0, 8.5],

    // BCTT (thang 0-10) - lưu rubric vào comment JSON + r1..r8 + rubricTotal
    ["sc-04", "sv02@univ.edu.vn", "BCTT", "GVHD", 8.5, '{"v":1,"rubric":[0.75,0.75,1.5,1.25,1.5,0.75,0.5,1.5],"total":8.5,"note":"BCTT GVHD: bai lam tot, gia tri thuc tien; can bo sung tai lieu."}', now, 0.75, 0.75, 1.5, 1.25, 1.5, 0.75, 0.5, 1.5, 8.5],
    ["sc-05", "sv02@univ.edu.vn", "BCTT", "GVPB", 9.0, '{"v":1,"rubric":[0.75,0.75,1.75,1.25,1.5,0.75,0.75,1.5],"total":9.0,"note":"BCTT GVPB: phan tich sau sac; phuong phap khoa hoc; ket qua dang tin cay."}', now, 0.75, 0.75, 1.75, 1.25, 1.5, 0.75, 0.75, 1.5, 9.0],
    ["sc-06", "sv02@univ.edu.vn", "BCTT", "CHUTICH", 8.0, '{"v":1,"rubric":[0.75,0.5,1.25,1.25,1.5,0.75,0.75,1.25],"total":8.0,"note":"BCTT Chu tich: dap ung yeu cau; co diem tot ve noi dung va tra loi cau hoi."}', now, 0.75, 0.5, 1.25, 1.25, 1.5, 0.75, 0.75, 1.25, 8.0]
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
  var student = readObjects("STUDENTS").find(function (s) { return String(s.email || "").toLowerCase() === String(email || "").toLowerCase(); }) || { status: "NEW" };
  var regs = readObjects("REGISTRATIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var subs = readObjects("SUBMISSIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var councils = readObjects("COUNCILS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var revisions = readObjects("REVISIONS").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var scores = readObjects("SCORES").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
  var periods = readObjects("PERIODS").filter(function (x) { return x.status === "ACTIVE"; });
  var suggestions = readObjects("TOPIC_SUGGESTIONS").filter(function (x) { return x.status === "APPROVED"; });

  var lecturers = readObjects("LECTURERS").map(function (l) {
    var info = readObjects("USERS").find(function (u) { return u.email === l.email; }) || {};
    return { email: l.email, name: info.name || l.email, majors: l.majors || "", quota: l.quota, currentSlot: l.currentSlot, expertise: l.expertise };
  });

  var fields = [];
  var existingFields = readObjects("TOPICS").map(function (t) { return t.field; });
  if (existingFields.length === 0) fields = ["CNTT", "HTTT", "AI", "Data", "Security", "Cloud"];
  else fields = existingFields.filter(unique);

  return {
    ok: true,
    data: {
      student: student,
      registrations: regs,
      submissions: subs,
      councils: councils,
      revisions: revisions,
      scores: scores,
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

  if (regType === "KLTN" && student.status !== "BCTT_APPROVED" && student.status !== "KLTN_REGISTERED") {
    return { ok: false, message: "Phai hoan thanh BCTT moi duoc dang ky KLTN" };
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

  writeAuditLog("SV", studentEmail, "CREATE_REGISTRATION", id, regType + " - " + topicName + " - GV:" + lecturerEmail);
  return { ok: true, data: { id: id, status: newStatus } };
}

function saveSubmission(payload) {
  var studentEmail = payload.student;
  var subType = payload.type;
  var fileUrl = payload.file || "";
  var turnitin = payload.turnitin || "";
  var score = payload.score || "";
  var now = new Date().toISOString();

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
  return { ok: true, message: "Luu phieu xac nhan thuc tap thanh cong" };
}

/** Khớp frontend KLTN_RUBRIC_CRITERIA — tổng tối đa 12 */
var KLTN_RUBRIC_MAXS = [1, 1, 2, 2, 2, 1, 1, 2];

// BCTT: dùng cùng 8 tiêu chí với KLTN, nhưng tổng max = 10.
// Tương ứng scale (10/12) và làm tròn theo bước 0.25 để tổng đúng 10:
// [TC1..TC8] = [0.75,0.75,1.75,1.75,1.75,0.75,0.75,1.75]
var BCTT_RUBRIC_MAX_TOTAL = 10;
var BCTT_RUBRIC_MAXS = [0.75, 0.75, 1.75, 1.75, 1.75, 0.75, 0.75, 1.75];

function parseCommentForRubric(comment) {
  if (!comment || typeof comment !== "string") return { note: "", rubric: null, total: null };
  var s = String(comment).trim();
  if (s.charAt(0) !== "{") return { note: comment, rubric: null, total: null };
  try {
    var o = JSON.parse(s);
    if (o && o.v === 1 && o.rubric) {
      return { note: o.note || "", rubric: o.rubric, total: o.total };
    }
  } catch (e) {}
  return { note: comment, rubric: null, total: null };
}

function saveScore(payload) {
  var studentEmail = payload.student;
  var scoreType = payload.type || "KLTN";
  var scorerRole = payload.scorerRole || payload.role || "GV";
  var scoreVal = payload.score;
  var comment = payload.comment || "";

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
    rubricTotal = Number(scoreVal); // sync rounding with 'score' column + comment.total
    comment = JSON.stringify({ v: 1, rubric: rubricArr, total: rubricTotal, note: payload.comment || "" });
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
      if (s.score !== undefined && s.score !== null && s.score !== "" && !isNaN(Number(s.score))) {
        total += Number(s.score);
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
    var key = s.role || "THANHVIEN";
    var p = parseCommentForRubric(s.comment);
    var disp = p.rubric ? (p.note || "") : s.comment;
    result[key] = {
      score: s.score,
      comment: disp,
      rubric: p.rubric,
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

  var filtered = [];
  if (mode === "guidance") {
    filtered = regs.filter(function (r) { return String(r.lecturer || "").toLowerCase() === String(email || "").toLowerCase(); });
  } else if (mode === "review") {
    var councils = readObjects("COUNCILS").filter(function (c) {
      return String(c.gvpb || "").toLowerCase() === String(email || "").toLowerCase();
    });
    var studentEmails = councils.map(function (c) { return c.student; });
    filtered = regs.filter(function (r) { return studentEmails.indexOf(r.student) !== -1; });
  } else if (mode === "council") {
    var allCouncils = readObjects("COUNCILS").filter(function (c) {
      return String(c.chairman || "").toLowerCase() === String(email || "").toLowerCase() ||
             String(c.gvhd || "").toLowerCase() === String(email || "").toLowerCase() ||
             String(c.secretary || "").toLowerCase() === String(email || "").toLowerCase();
    });
    var councilStudents = allCouncils.map(function (c) { return c.student; });
    filtered = regs.filter(function (r) { return councilStudents.indexOf(r.student) !== -1; });
  }

  var merged = filtered.map(function (r) {
    var sub = subs.find(function (s) { return String(s.student || "").toLowerCase() === String(r.student || "").toLowerCase() && s.type === r.type; }) || {};
    var st = users.find(function (u) { return String(u.email || "").toLowerCase() === String(r.student || "").toLowerCase(); }) || {};
    var stScores = scores.filter(function (s) { return String(s.student || "").toLowerCase() === String(r.student || "").toLowerCase() && s.type === r.type; });
    var myScore = null;
    stScores.forEach(function (s) {
      if (s.role === payload.role || (payload.role === "GV" && s.role === "GVHD")) {
        var pr = parseCommentForRubric(s.comment);
        myScore = {
          score: s.score,
          comment: pr.rubric ? (pr.note || "") : s.comment,
          rubric: pr.rubric
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

function getTBMDashboard(payload) {
  var lecturers = readObjects("LECTURERS").map(function (l) {
    var info = readObjects("USERS").find(function (u) { return u.email === l.email; }) || {};
    return { email: l.email, name: info.name || l.email, majors: l.majors, quota: l.quota, currentSlot: l.currentSlot, expertise: l.expertise };
  });

  var registrations = readObjects("REGISTRATIONS");
  var students = readObjects("STUDENTS");
  var submissions = readObjects("SUBMISSIONS");
  var councils = readObjects("COUNCILS");
  var revisions = readObjects("REVISIONS");
  var scores = readObjects("SCORES");
  var users = readObjects("USERS");

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

  return {
    ok: true,
    data: {
      lecturers: lecturers,
      registrations: registrations,
      students: students,
      submissions: submissions,
      councils: councils,
      revisions: revisions,
      scores: scores,
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
    stScores.forEach(function (s) { scoreBreakdown[s.role] = { score: s.score, comment: s.comment }; });

    var finalAvg = 0, cnt = 0;
    stScores.forEach(function (s) {
      if (s.score && !isNaN(Number(s.score))) { finalAvg += Number(s.score); cnt++; }
    });
    if (cnt > 0) finalAvg = (finalAvg / cnt).toFixed(2);

    return {
      student: c.student,
      studentName: usr.name || c.student,
      topic: regKltn.topicName || regKltn.topic || "—",
      date: c.date,
      location: c.location,
      councilStatus: c.councilStatus || "PENDING",
      finalScore: c.finalScore || finalAvg,
      minutesUrl: c.minutesUrl || "",
      gvhdScore: scoreBreakdown.GVHD ? scoreBreakdown.GVHD.score : "",
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
    stScores.forEach(function (s) { scoreBreakdown[s.role] = { score: s.score, comment: s.comment }; });

    var finalAvg = 0, cnt = 0;
    stScores.forEach(function (s) {
      if (s.score && !isNaN(Number(s.score))) { finalAvg += Number(s.score); cnt++; }
    });
    if (cnt > 0) finalAvg = (finalAvg / cnt).toFixed(2);

    return {
      student: c.student,
      studentName: usr.name || c.student,
      date: c.date,
      location: c.location,
      councilStatus: c.councilStatus || "PENDING",
      finalScore: c.finalScore || finalAvg,
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

  var kltnScores = scores.filter(function (s) { return s.type === "KLTN" && s.score && !isNaN(Number(s.score)); });
  var avgScore = 0;
  if (kltnScores.length > 0) {
    var sum = kltnScores.reduce(function (acc, s) { return acc + Number(s.score); }, 0);
    avgScore = (sum / kltnScores.length).toFixed(2);
  }

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
      revisionStats: revisionStats,
      periods: periods,
      kltnScores: kltnScores
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
      }
      writeAuditLog(payload.role || "TBM", payload.by || "TBM", "UPDATE_REGISTRATION_STATUS", payload.id, payload.status);
      return { ok: true, message: "Cap nhat trang thai thanh cong" };
    }
  }
  return { ok: false, message: "Khong tim thay dang ky" };
}

function assignCouncil(payload) {
  var studentEmail = payload.student;
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
  var studentEmail = payload.student;
  var status = payload.status || "DEFENDED";
  var finalScore = payload.finalScore || "";

  var sh = getSheet("COUNCILS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");
  var statusIdx = headers.indexOf("councilStatus");
  var scoreIdx = headers.indexOf("finalScore");

  for (var i = 1; i < values.length; i++) {
    if (values[i][studentIdx] === studentEmail) {
      if (statusIdx >= 0) sh.getRange(i + 1, statusIdx + 1).setValue(status);
      if (scoreIdx >= 0 && finalScore) sh.getRange(i + 1, scoreIdx + 1).setValue(finalScore);
      writeAuditLog(payload.role || "THUKY", payload.by || "thuky", "UPDATE_COUNCIL_STATUS", studentEmail, status);
      return { ok: true, message: "Cap nhat trang thai hoi dong" };
    }
  }
  return { ok: false, message: "Khong tim thay hoi dong" };
}

function saveFinalScore(payload) {
  var studentEmail = payload.student;
  var finalScore = payload.finalScore;

  var sh = getSheet("COUNCILS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");
  var scoreIdx = headers.indexOf("finalScore");
  var statusIdx = headers.indexOf("councilStatus");

  for (var i = 1; i < values.length; i++) {
    if (values[i][studentIdx] === studentEmail) {
      if (scoreIdx >= 0) sh.getRange(i + 1, scoreIdx + 1).setValue(finalScore);
      if (statusIdx >= 0) sh.getRange(i + 1, statusIdx + 1).setValue("DEFENDED");
      writeAuditLog(payload.role || "THUKY", payload.by || "thuky", "SAVE_FINAL_SCORE", studentEmail, finalScore);
      return { ok: true, message: "Luu diem cuoi cung" };
    }
  }
  return { ok: false, message: "Khong tim thay hoi dong" };
}

function saveCouncilMinutesUrl(payload) {
  var studentEmail = payload.student;
  var minutesUrl = payload.minutesUrl || "";
  var hc = getHeaderColumnMap("COUNCILS");
  if (!hc) return { ok: false, message: "Khong doc duoc sheet COUNCILS" };
  var stCol = hc.map["student"];
  var urlCol = hc.map["minutesurl"];
  if (stCol === undefined) return { ok: false, message: "Thieu cot student" };
  if (urlCol === undefined) {
    return { ok: false, message: "Sheet COUNCILS chua co cot minutesUrl. Them cot minutesUrl (link bien ban hop HD) vao hang tieu de." };
  }
  for (var i = hc.headerRowIdx + 1; i < hc.values.length; i++) {
    if (String(hc.values[i][stCol] || "").toLowerCase() === String(studentEmail || "").toLowerCase()) {
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
  var scores = readObjects("SCORES").filter(function (x) { return String(x.student || "").toLowerCase() === String(email || "").toLowerCase(); });
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

  subs.forEach(function (s) {
    timeline.push({
      key: "SUB_" + s.type,
      label: "Nop file " + s.type,
      status: s.file ? "DONE" : "PENDING",
      desc: "Diem: " + (s.score || "Chua cham"),
      score: s.score,
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

  scores.forEach(function (s) {
    timeline.push({
      key: "SCORE_" + s.role + "_" + s.type,
      label: "Diem " + s.type + " (" + s.role + ")",
      status: s.score ? "DONE" : "PENDING",
      desc: "Diem: " + (s.score || "Chua cham") + (s.comment ? " | Nhan xet: " + s.comment.substring(0, 50) : ""),
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
  var studentEmail = payload.student;
  var approval = payload.approval || "YES";
  var now = new Date().toISOString();

  var sh = getSheet("REVISIONS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");
  var approvalIdx = headers.indexOf("gvhdApproval");
  var dateIdx = headers.indexOf("gvhdApprovalDate");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][studentIdx] || "").toLowerCase() === String(studentEmail || "").toLowerCase()) {
      if (approvalIdx >= 0) sh.getRange(i + 1, approvalIdx + 1).setValue(approval);
      if (dateIdx >= 0) sh.getRange(i + 1, dateIdx + 1).setValue(now);
      writeAuditLog("GV", payload.by || "gvhd", "APPROVE_REVISION_GVHD", studentEmail, approval);
      return { ok: true, message: "GVHD da " + (approval === "YES" ? "dong y" : "khong dong y") + " chinh sua" };
    }
  }
  return { ok: false, message: "Khong tim thay bai chinh sua" };
}

function approveRevisionChairman(payload) {
  var studentEmail = payload.student;
  var approval = payload.approval || "YES";
  var now = new Date().toISOString();

  var sh = getSheet("REVISIONS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");
  var approvalIdx = headers.indexOf("chairmanApproval");
  var dateIdx = headers.indexOf("chairmanApprovalDate");
  var finalIdx = headers.indexOf("finalStatus");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][studentIdx] || "").toLowerCase() === String(studentEmail || "").toLowerCase()) {
      if (approvalIdx >= 0) sh.getRange(i + 1, approvalIdx + 1).setValue(approval);
      if (dateIdx >= 0) sh.getRange(i + 1, dateIdx + 1).setValue(now);
      if (finalIdx >= 0) sh.getRange(i + 1, finalIdx + 1).setValue(approval);
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

    var canApproveGVHD = role === "GV" && String(council.gvhd || "").toLowerCase() === String(email || "").toLowerCase();
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
  scores.forEach(function (s) { scoreBreakdown[s.role] = s; });

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
      var score = 0;
      for (var e = 0; e < expectedNorm.length; e++) {
        var key = expectedNorm[e];
        if (!key) continue;
        // Nhận định "trùng" nếu cell header có chứa key.
        if (norm.join("|").indexOf(key) !== -1) score++;
      }
      if (score >= 2) {
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
  var sh = getSheet("REVISIONS");
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var studentIdx = headers.indexOf("student");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][studentIdx] || "").toLowerCase() === String(studentEmail || "").toLowerCase()) {
      if (kltnFile) sh.getRange(i + 1, 3).setValue(kltnFile);
      if (revisionNote) sh.getRange(i + 1, 4).setValue(revisionNote);
      sh.getRange(i + 1, 5).setValue(submittedAt);
      sh.getRange(i + 1, 6).setValue("PENDING");
      sh.getRange(i + 1, 8).setValue("PENDING");
      sh.getRange(i + 1, 10).setValue("");
      return;
    }
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
