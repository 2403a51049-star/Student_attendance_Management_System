const $ = id => document.getElementById(id);
let token = localStorage.getItem("attendanceToken") || "";
let currentUser = JSON.parse(localStorage.getItem("attendanceUser") || "null");
let students = [];

async function api(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`/api${url}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
function message(id, text, good = false) { $(id).textContent = text; $(id).style.color = good ? "#26734a" : "#b33b36"; }
function showApp() {
  $("authView").classList.toggle("hidden", !!currentUser);
  $("appView").classList.toggle("hidden", !currentUser);
  $("logoutBtn").classList.toggle("hidden", !currentUser);
  if (currentUser) {
    $("welcomeName").textContent = `Hello, ${currentUser.name}`;
    $("roleLabel").textContent = `${currentUser.role.toUpperCase()} · ${currentUser.email}`;
    $("facultyPanel").classList.toggle("hidden", !["faculty", "admin"].includes(currentUser.role));
    $("adminPanel").classList.toggle("hidden", currentUser.role !== "admin");
    loadDashboard();
  }
}
async function loadDashboard() {
  try {
    const data = await api("/attendance/mine");
    const records = data.records || [];
    const total = records.length, present = records.filter(r => r.status === "Present").length;
    $("totalClasses").textContent = total;
    $("presentCount").textContent = present;
    $("overallPercent").textContent = `${total ? (present / total * 100).toFixed(1) : 0}%`;
    $("summaryArea").innerHTML = "";
    if (!data.summaries.length) $("summaryArea").innerHTML = '<p class="muted">No attendance records yet.</p>';
    data.summaries.forEach(s => {
      const card = document.createElement("div"); card.className = "summary-card";
      card.innerHTML = `<strong></strong><span></span>`;
      card.querySelector("strong").textContent = s.course;
      card.querySelector("span").textContent = `${s.present}/${s.total} present · ${s.percentage}%`;
      $("summaryArea").appendChild(card);
    });
    if (["faculty", "admin"].includes(currentUser.role)) await loadCourses();
  } catch (e) { message("appMessage", e.message); }
}
async function loadCourses() {
  const courses = await api("/courses");
  $("courseSelect").innerHTML = '<option value="">Select course</option>';
  courses.forEach(c => {
    const o = document.createElement("option"); o.value = c._id; o.textContent = `${c.courseCode} - ${c.courseName} (${c.section})`; $("courseSelect").appendChild(o);
  });
}
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: $("email").value, password: $("password").value }) });
    token = data.token; currentUser = data.user;
    localStorage.setItem("attendanceToken", token); localStorage.setItem("attendanceUser", JSON.stringify(currentUser));
    message("authMessage", "Signed in successfully", true); showApp();
  } catch (err) { message("authMessage", err.message); }
});
$("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await api("/auth/register", { method: "POST", body: JSON.stringify({ name: $("regName").value, email: $("regEmail").value, password: $("regPassword").value, role: $("regRole").value, rollNumber: $("regRoll").value }) });
    message("authMessage", "Account created. You can now sign in.", true);
    $("loginForm").reset();
  } catch (err) { message("authMessage", err.message); }
});
$("logoutBtn").addEventListener("click", () => {
  token = ""; currentUser = null; localStorage.removeItem("attendanceToken"); localStorage.removeItem("attendanceUser"); showApp();
});
$("refreshBtn").addEventListener("click", loadDashboard);
$("loadStudentsBtn").addEventListener("click", async () => {
  try {
    students = await api("/students");
    $("studentList").innerHTML = "";
    students.forEach(s => {
      const row = document.createElement("div"); row.className = "student-row";
      const name = document.createElement("span"); name.textContent = `${s.rollNumber || ""} ${s.name}`;
      const select = document.createElement("select"); select.dataset.id = s._id;
      select.innerHTML = '<option>Present</option><option>Absent</option>';
      row.append(name, select); $("studentList").appendChild(row);
    });
    $("saveAttendanceBtn").classList.toggle("hidden", !students.length);
    if (!students.length) $("studentList").textContent = "No students found. Admin can add students.";
  } catch (err) { message("appMessage", err.message); }
});
$("saveAttendanceBtn").addEventListener("click", async () => {
  try {
    const records = [...$("studentList").querySelectorAll("select")].map(s => ({ studentId: s.dataset.id, status: s.value }));
    await api("/attendance", { method: "POST", body: JSON.stringify({ courseId: $("courseSelect").value, date: $("attendanceDate").value, records }) });
    message("appMessage", "Attendance saved successfully.", true); await loadDashboard();
  } catch (err) { message("appMessage", err.message); }
});
$("courseForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await api("/courses", { method: "POST", body: JSON.stringify({ courseCode: $("courseCode").value, courseName: $("courseName").value, section: $("section").value }) });
    e.target.reset(); message("appMessage", "Course added.", true); await loadCourses();
  } catch (err) { message("appMessage", err.message); }
});
$("studentForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await api("/students", { method: "POST", body: JSON.stringify({ name: $("studentName").value, email: $("studentEmail").value, rollNumber: $("studentRoll").value, password: $("studentPassword").value }) });
    e.target.reset(); message("appMessage", "Student added.", true);
  } catch (err) { message("appMessage", err.message); }
});
showApp();
