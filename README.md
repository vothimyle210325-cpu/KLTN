# KLTN Portal (Frontend + Google Apps Script API)

Du an gom 2 phan:

- `frontend`: ReactJS + MUI + Redux Toolkit + React Hook Form
- `backend/apps-script`: API bang Google Apps Script, deploy Web App public

## 1) Cau truc Google Sheet bat buoc

Can co cac sheet va header dung thu tu:

- `USERS`: `email | password | name | role | major`
- `STUDENTS`: `email | mssv | status` (`NEW | BCTT_DONE | KLTN_DONE`)
- `LECTURERS`: `email | quota | currentSlot | majors`
- `TOPICS`: `id | name | field | createdBy`
- `REGISTRATIONS`: `id | student | type | topic | lecturer | status | dot`
- `SUBMISSIONS`: `student | type | file | turnitin | score`
- `COUNCILS`: `student | gvhd | gvpb | chairman | date | location`

Apps Script se co ham `setupSheets()` de tao/chuan hoa header tu dong.

## 2) Frontend (React)

### Cai dat

```bash
cd frontend
npm install
npm run dev
```

Tao file `.env`:

```bash
VITE_API_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

## 3) Backend (Google Apps Script)

1. Tao project Apps Script moi.
2. Copy noi dung `backend/apps-script/Code.gs`.
3. Sua `CONFIG.SPREADSHEET_ID`.
4. Chay ham `setupSheets()`.
5. (Tuy chon) chay `seedFromSourceSheet()` de nap du lieu GV, SV tu file sheet nguon.
   - Hoac chay nhanh demo bang `setupAndSeedSample()` de tao full sample data.
6. Deploy -> New deployment -> Web app:
   - Execute as: Me
   - Who has access: Anyone
7. Lay public link va gan vao `VITE_API_URL`.

## 4) Chuc nang da ho tro (dashboard day du)

- `SV`: login, phan quyen, dang ky `BCTT/KLTN`, filter GV theo nganh, upload PDF, timeline trang thai
- `GV`: tab huong dan / phan bien / hoi dong, cap nhat turnitin, cham diem
- `TBM`: quan ly quota GV, duyet de tai (approve/reject), phan cong hoi dong, thong ke nhanh
- Seed data tu Google Sheet nguon (file Excel da import len Sheet) qua ham `seedFromSourceSheet()`

## 5) API Apps Script chinh

- `login`
- `register`
- `getStudentDashboard`
- `createRegistration`
- `saveSubmission`
- `getGuidanceList`, `getReviewList`, `getCouncilList`
- `saveScore`
- `getTBMDashboard`
- `updateRegistrationStatus`
- `assignCouncil`
- `approveRegistrationsBulk`

## 6) Template Google Sheet + Seed mau (copy la chay)

### A. Tao template backend + sample data ngay

Trong Apps Script, chay lan luot:

1. `setupSheets()`
2. `seedSampleData()` hoac `setupAndSeedSample()`

Tai khoan demo sau khi seed:

- `sv01@univ.edu.vn / 123456` (SV, da du dieu kien KLTN)
- `sv02@univ.edu.vn / 123456` (SV, trang thai NEW)
- `gv01@univ.edu.vn / 123456` (GV)
- `gv02@univ.edu.vn / 123456` (GV)
- `tbm@univ.edu.vn / 123456` (TBM)
- `admin@univ.edu.vn / admin123` (ADMIN)

Neu can tao Google Sheet backend moi (tu dong tao sheet + seed), chay:

- `createBackendTemplateSpreadsheet()`

Ham tra ve `spreadsheetId` va `url`, sau do gan ID nay vao `CONFIG.SPREADSHEET_ID`.

### B. Gan du lieu tu file Excel (qua Google Sheet nguon)

Neu ban da import Excel len Google Sheet nguon:

1. Dat ID vao `CONFIG.SOURCE_DATA_SPREADSHEET_ID`
2. Dam bao co sheet `Data` voi cot:
   - `email | name | role | major | mssv | quota | majors`
3. Chay `seedFromSourceSheet()`

Neu chua co sheet `Data`, chay `createSourceDataTemplate()` de tao mau.

## 7) UI enterprise (React)

Da co:

- Layout dashboard kieu doanh nghiep: top bar + left sidebar + KPI cards
- Role-based workflows cho `SV / GV / TBM`
- Trang thai timeline + quota + duyet de tai + hoi dong + cham diem
- MUI theme enterprise (typography, palette, card style)
- Nho phien dang nhap (localStorage), auto giu user sau refresh
- Tim kiem nhanh + refresh dashboard cho GV/TBM
- Bulk approve ho so pending cho TBM
- Phan trang + sort cot cho bang GV/TBM
- Upload PDF that len Google Drive qua Apps Script API
- Audit logs theo role trong dashboard TBM
- Export bao cao dang ky ra Excel/PDF
- Toi uu hieu nang: lazy load page + tach chunk + dynamic import thu vien export
- Bo loc nang cao: filter theo trang thai/loai + bulk save diem theo trang
- Export them `audit-logs.csv`
- DataGrid (MUI X) cho bang GV/TBM: sticky header, column visibility, filter/sort panel
- Login co nut "Kiem tra ket noi API" de xac nhan endpoint truoc khi dang nhap

## 8) Luu y quan trong

- Ban dang dung may chua cai Node.js (`npm` chua co trong PATH), can cai Node LTS de chay frontend.
- API hien su dung token don gian dua tren email + role tra ve sau login (de demo va trinh bay).
