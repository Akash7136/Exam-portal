(function () {
  "use strict";
  const app = window.CampusExam;
  const esc = app.escapeHTML;
  const students = app.read("students");
  const faculty = app.read("faculty");
  const exams = app.read("exams");
  const subjects = app.read("subjects");
  const departments = app.read("departments");
  const roles = app.read("roles");
  const logs = app.read("logs");
  const $ = (id) => document.getElementById(id);
  let filter = "";

  function log(title) {
    logs.unshift({ title, detail: "Administrator action · " + new Date().toLocaleString() });
    app.write("logs", logs);
    renderLogs();
  }

  function renderPeople() {
    const match = (values) => values.join(" ").toLowerCase().includes(filter);
    const visibleStudents = students.filter((item) => match(Object.values(item)));
    $("admin-student-rows").innerHTML = visibleStudents.map((item) => `<tr><td>${esc(item.id)}</td><td>${esc(item.name)}</td><td>${esc(item.className)}</td><td><span class="badge badge-blue">${esc(item.status)}</span></td><td><button class="btn btn-danger btn-sm" type="button" data-remove-student="${esc(item.id)}">Remove</button></td></tr>`).join("");
    $("admin-student-empty").hidden = visibleStudents.length > 0;
    const visibleFaculty = faculty.filter((item) => match(Object.values(item)));
    $("admin-faculty-rows").innerHTML = visibleFaculty.map((item) => `<tr><td>${esc(item.id)}</td><td>${esc(item.name)}</td><td>${esc(item.department)}</td><td>${esc(item.email)}</td><td><button class="btn btn-danger btn-sm" type="button" data-remove-faculty="${esc(item.id)}">Remove</button></td></tr>`).join("");
    $("admin-faculty-empty").hidden = visibleFaculty.length > 0;
    $("total-students").textContent = String(students.length);
    $("total-faculty").textContent = String(faculty.length);
    $("total-exams").textContent = String(exams.length);
    $("total-subjects").textContent = String(subjects.length);
  }

  function renderCatalog() {
    $("department-list").innerHTML = departments.length ? departments.map((name, index) => `<div class="activity-item"><strong>${esc(name)}</strong><button type="button" class="btn btn-danger btn-sm" data-remove-department="${index}">Remove</button></div>`).join("") : '<div class="empty-state">No departments added.</div>';
    $("subject-list").innerHTML = subjects.length ? subjects.map((name, index) => `<div class="activity-item"><strong>${esc(name)}</strong><button type="button" class="btn btn-danger btn-sm" data-remove-subject="${index}">Remove</button></div>`).join("") : '<div class="empty-state">No subjects added.</div>';
  }

  function renderExams() {
    $("admin-exam-rows").innerHTML = exams.length ? exams.map((item) => `<tr><td><strong>${esc(item.title)}</strong></td><td>${esc(item.subject)}</td><td>${esc(item.date)} · ${esc(item.time)}</td><td>${esc(item.duration)} min</td><td>${esc(item.className)}</td><td><span class="badge ${item.status === "Completed" ? "badge-gray" : "badge-green"}">${esc(item.status)}</span></td></tr>`).join("") : '<tr><td colspan="6" class="muted">No exams have been created.</td></tr>';
  }

  function renderLogs() {
    $("activity-list").innerHTML = logs.length ? logs.map((item) => `<div class="activity-item"><span class="stat-icon" data-icon="check">${app.icon("check")}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></div></div>`).join("") : '<div class="empty-state">No activity yet.</div>';
  }

  function renderRoles() {
    $("role-rows").innerHTML = roles.length ? roles.map((item, index) => `<tr><td><strong>${esc(item.email)}</strong><br><span class="muted">${esc(item.name)}</span></td><td><select aria-label="Role for ${esc(item.email)}" data-role-index="${index}"><option value="student" ${item.role === "student" ? "selected" : ""}>Student</option><option value="faculty" ${item.role === "faculty" ? "selected" : ""}>Faculty</option><option value="admin" ${item.role === "admin" ? "selected" : ""}>Admin</option></select></td><td>${esc(item.role)}-dashboard.html</td></tr>`).join("") : '<tr><td colspan="3" class="muted">No role assignments.</td></tr>';
  }

  document.addEventListener("click", (event) => {
    const removeStudent = event.target.closest("[data-remove-student]");
    const removeFaculty = event.target.closest("[data-remove-faculty]");
    const removeSubject = event.target.closest("[data-remove-subject]");
    const removeDepartment = event.target.closest("[data-remove-department]");
    if (removeStudent) {
      if (!window.confirm("Remove this student from local demonstration data?")) return;
      students.splice(students.findIndex((item) => item.id === removeStudent.dataset.removeStudent), 1);
      app.write("students", students); log("Student removed from demo roster"); renderPeople();
    } else if (removeFaculty) {
      if (!window.confirm("Remove this faculty record from local demonstration data?")) return;
      faculty.splice(faculty.findIndex((item) => item.id === removeFaculty.dataset.removeFaculty), 1);
      app.write("faculty", faculty); log("Faculty record removed from demo"); renderPeople();
    } else if (removeSubject) {
      if (!window.confirm("Remove this subject from local demonstration data?")) return;
      subjects.splice(Number(removeSubject.dataset.removeSubject), 1);
      app.write("subjects", subjects); log("Subject removed from demo catalog"); renderCatalog(); renderPeople();
    } else if (removeDepartment) {
      if (!window.confirm("Remove this department from local demonstration data?")) return;
      departments.splice(Number(removeDepartment.dataset.removeDepartment), 1);
      app.write("departments", departments); log("Department removed from demo catalog"); renderCatalog();
    }
  });

  document.addEventListener("change", (event) => {
    const select = event.target.closest("[data-role-index]");
    if (!select) return;
    roles[Number(select.dataset.roleIndex)].role = select.value;
    app.write("roles", roles);
    renderRoles();
    log("Demo role assignment changed");
    app.toast("Demo dashboard assignment updated in this browser.");
  });

  $("global-search").addEventListener("input", (event) => { filter = event.target.value.trim().toLowerCase(); renderPeople(); });
  $("add-student").addEventListener("click", () => {
    const name = window.prompt("Student name:");
    if (name === null) return;
    if (!name.trim()) { app.toast("Student name cannot be empty.", "error"); return; }
    const className = window.prompt("Class or cohort:");
    if (className === null) return;
    if (!className.trim()) { app.toast("Class cannot be empty.", "error"); return; }
    students.push({ id: "ST-" + Date.now().toString().slice(-6), name: name.trim(), className: className.trim(), status: "Upcoming" });
    app.write("students", students); log("Student added to demo roster"); renderPeople(); app.toast("Student added to local demo data.");
  });
  $("add-faculty").addEventListener("click", () => {
    const name = window.prompt("Faculty name:");
    if (name === null) return;
    if (!name.trim()) { app.toast("Faculty name cannot be empty.", "error"); return; }
    const email = window.prompt("Faculty demo email:");
    if (email === null) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { app.toast("Enter a valid email address.", "error"); return; }
    const department = window.prompt("Department:");
    if (department === null) return;
    faculty.push({ id: "FC-" + Date.now().toString().slice(-6), name: name.trim(), email: email.trim(), department: department.trim() });
    app.write("faculty", faculty); log("Faculty added to demo roster"); renderPeople(); app.toast("Faculty member added to local demo data.");
  });
  $("department-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("department-name");
    const name = input.value.trim();
    if (departments.some((item) => item.toLowerCase() === name.toLowerCase())) { app.toast("That department is already in the demo catalog.", "error"); return; }
    departments.push(name); app.write("departments", departments); log("Department added to demo catalog"); renderCatalog(); input.value = ""; app.toast("Department added.");
  });
  $("subject-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("subject-name");
    const name = input.value.trim();
    if (subjects.some((item) => item.toLowerCase() === name.toLowerCase())) { app.toast("That subject is already in the demo catalog.", "error"); return; }
    subjects.push(name); app.write("subjects", subjects); log("Subject added to demo catalog"); renderCatalog(); renderPeople(); input.value = ""; app.toast("Subject added.");
  });

  renderPeople(); renderCatalog(); renderExams(); renderLogs(); renderRoles();
})();
