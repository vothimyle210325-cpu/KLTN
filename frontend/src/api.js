import axios from "axios";

/** Dev: leave VITE_API_URL unset to use Vite proxy /api. Prod: set full Apps Script web app URL. */
const raw = typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL : "";
const API_BASE = raw.trim() || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000
});

function normalizeApiData(data) {
  if (data == null) return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data;
}

export async function callApi(action, payload = {}) {
  try {
    const res = await api.post("", { action, ...payload });
    const data = normalizeApiData(res.data);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return {
        ok: false,
        message:
          "Phản hồi máy chủ không hợp lệ (không phải JSON). Kiểm tra VITE_API_URL, triển khai Apps Script, hoặc dùng proxy /api khi chạy dev."
      };
    }
    return data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return { ok: false, message: "Không kết nối được máy chủ. Vui lòng kiểm tra kết nối mạng." };
    }
    if (error.response) {
      const raw = error.response?.data;
      const parsed = normalizeApiData(raw);
      const msg =
        parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.message
          ? parsed.message
          : typeof raw === "string" && raw.length < 200
            ? raw
            : `Lỗi máy chủ: ${error.response?.status}`;
      return { ok: false, message: msg };
    }
    return { ok: false, message: error.message || "Lỗi mạng. Vui lòng thử lại." };
  }
}

export async function pingApi() {
  try {
    const res = await api.get("");
    const data = normalizeApiData(res.data);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, message: "Phản hồi API không hợp lệ. Kiểm tra VITE_API_URL." };
    }
    return data;
  } catch (error) {
    return { ok: false, message: "Không kết nối được API, vui lòng kiểm tra VITE_API_URL." };
  }
}

// === STUDENT ===
export const studentApi = {
  getDashboard: (email) => callApi("getStudentDashboard", { email }),
  createRegistration: (payload) => callApi("createRegistration", payload),
  saveSubmission: (payload) => callApi("saveSubmission", payload),
  saveInternshipForm: (payload) => callApi("saveInternshipForm", payload),
  getTimeline: (email) => callApi("getStudentTimeline", { email }),
  getTopicSuggestions: (email, field) => callApi("getTopicSuggestions", { email, field }),
  submitRevision: (payload) => callApi("submitRevision", payload),
  getRevisionStatus: (email) => callApi("getRevisionStatus", { email }),
};

// === LECTURER ===
export const lecturerApi = {
  getGuidanceList: (email, role) => callApi("getGuidanceList", { email, role }),
  getReviewList: (email, role) => callApi("getReviewList", { email, role }),
  getCouncilList: (email, role) => callApi("getCouncilList", { email, role }),
  saveScore: (payload) => callApi("saveScore", payload),
  saveReviewComment: (payload) => callApi("saveReviewComment", payload),
  getChairmanDashboard: (email) => callApi("getChairmanDashboard", { email }),
  getSecretaryDashboard: (email) => callApi("getSecretaryDashboard", { email }),
  getRevisionApprovals: (email, role) => callApi("getRevisionApprovals", { email, role }),
  approveRevisionGVHD: (payload) => callApi("approveRevisionGVHD", payload),
  approveRevisionChairman: (payload) => callApi("approveRevisionChairman", payload),
  getCouncilMinutes: (student) => callApi("getCouncilMinutes", { student }),
  saveCouncilMinutesUrl: (payload) => callApi("saveCouncilMinutesUrl", payload),
  getAllScores: (student, type) => callApi("getAllScores", { student, type }),
};

// === TOPIC SUGGESTIONS ===
export const topicApi = {
  getSuggestions: (email, field) => callApi("getTopicSuggestions", { email, field }),
  createSuggestion: (payload) => callApi("createTopicSuggestion", payload),
  approveSuggestion: (payload) => callApi("approveTopicSuggestion", payload),
};

// === TBM / ADMIN ===
export const tbmApi = {
  getDashboard: () => callApi("getTBMDashboard"),
  getStatistics: () => callApi("getStatistics"),
  openSlots: (payload) => callApi("openLecturerSlots", payload),
  updateQuota: (payload) => callApi("updateLecturerQuota", payload),
  bulkApprove: (payload) => callApi("approveRegistrationsBulk", payload),
  updateRegStatus: (payload) => callApi("updateRegistrationStatus", payload),
  assignCouncil: (payload) => callApi("assignCouncil", payload),
  updateCouncilStatus: (payload) => callApi("updateCouncilStatus", payload),
  saveFinalScore: (payload) => callApi("saveFinalScore", payload),
  saveCouncilMinutesUrl: (payload) => callApi("saveCouncilMinutesUrl", payload),
  sendCouncilNotification: (payload) => callApi("sendCouncilNotification", payload),
  getPeriods: () => callApi("getPeriods"),
  savePeriod: (payload) => callApi("savePeriod", payload),
};

// === USER MANAGEMENT ===
export const userApi = {
  login: (payload) => callApi("login", payload),
  register: (payload) => callApi("register", payload),
  getAllUsers: (payload) => callApi("getAllUsers", payload),
  approveUser: (payload) => callApi("approveUser", payload),
  rejectUser: (payload) => callApi("rejectUser", payload),
  updateProfile: (payload) => callApi("updateUserProfile", payload),
  changePassword: (payload) => callApi("changePassword", payload),
  changeRole: (payload) => callApi("changeUserRole", payload),
  deactivateUser: (payload) => callApi("deactivateUser", payload),
  activateUser: (payload) => callApi("activateUser", payload),
};

// === UPLOAD ===
export const uploadApi = {
  uploadPdf: (payload) => callApi("uploadPdfFile", payload),
};

// === AUDIT ===
export const auditApi = {
  getLogs: (limit) => callApi("getAuditLogs", { limit }),
};
