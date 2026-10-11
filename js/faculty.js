(function () {
  "use strict";
  const app = window.CampusExam;
  const byId = (id) => document.getElementById(id);
  const esc = app.escapeHTML;
  const questions = app.read("questions");
  const exams = app.read("exams");
  const students = app.read("students");
  const submissions = app.read("submissions");
  const announcements = app.read("announcements");
  const storedResults = app.read("results");
  const results = Array.isArray(storedResults) ? storedResults : [];

  function renderExams() {
    byId("exam-rows").innerHTML = exams.length ? exams.map((item) => `<tr data-search="${esc(item.title + " " + item.subject + " " + item.className)}"><td><strong>${esc(item.title)}</strong></td><td>${esc(item.subject)}</td><td>${esc(item.date)} · ${esc(item.time)}</td><td>${esc(item.duration)} min</td><td>${esc(item.className)}</td><td><span class="badge ${item.status === "Published" ? "badge-green" : item.status === "Draft" ? "badge-amber" : "badge-blue"}">${esc(item.status)}</span></td></tr>`).join("") : '<tr><td colspan="6" class="muted">No exams created yet.</td></tr>';
    byId("stat-exams").textContent = String(exams.length);
  }

  function renderQuestions() {
    const query = (byId("question-search").value || "").trim().toLowerCase();
    const type = byId("question-filter").value;
    const visible = questions.filter((item) => (!type || item.type === type) && (item.prompt + " " + item.subject + " " + item.type).toLowerCase().includes(query));
    byId("question-rows").innerHTML = visible.map((item) => `<tr><td style="white-space:normal;min-width:230px">${esc(item.prompt)}</td><td>${esc(item.subject)}</td><td>${esc(item.type)}</td><td><span class="badge badge-gray">${esc(item.difficulty)}</span></td><td><div class="actions-cell"><button class="btn btn-secondary btn-sm" type="button" data-edit-question="${esc(item.id)}">Edit</button><button class="btn btn-danger btn-sm" type="button" data-delete-question="${esc(item.id)}">Delete</button></div></td></tr>`).join("");
    byId("question-empty").hidden = visible.length > 0;
    byId("stat-questions").textContent = String(questions.length);
  }

  function renderStudents() {
    const query = (byId("global-search").value || "").trim().toLowerCase();
    const status = byId("student-status-filter").value;
    const filtered = students.filter((student) => (!status || student.status === status) && Object.values(student).join(" ").toLowerCase().includes(query));
    byId("student-rows").innerHTML = filtered.length ? filtered.map((student) => `<tr><td>${esc(student.id)}</td><td>${esc(student.name)}</td><td>${esc(student.className)}</td><td><span class="badge ${student.status === "Completed" ? "badge-green" : student.status === "In progress" ? "badge-amber" : "badge-blue"}">${esc(student.status)}</span></td></tr>`).join("") : "";
    byId("student-empty").hidden = filtered.length > 0;
    byId("stat-students").textContent = String(students.length);
  }

  function renderSubmissions() {
    byId("submission-rows").innerHTML = submissions.length ? submissions.map((item) => `<tr><td>${esc(item.student)}</td><td>${esc(item.exam)}</td><td>${esc(item.submitted)}</td><td><input class="table-input" aria-label="Marks for ${esc(item.student)}" type="number" min="0" max="${Number(item.total)}" value="${Number(item.marks)}" data-marks="${esc(item.id)}"> / ${Number(item.total)}</td><td><span class="badge ${item.status === "Reviewed" ? "badge-green" : "badge-amber"}">${esc(item.status)}</span></td><td><button class="btn btn-primary btn-sm" type="button" data-save-review="${esc(item.id)}">Save review</button></td></tr>`).join("") : '<tr><td colspan="6" class="muted">No submissions yet.</td></tr>';
    byId("stat-reviews").textContent = String(submissions.filter((item) => item.status !== "Reviewed").length);
    byId("report-pending").textContent = String(submissions.filter((item) => item.status !== "Reviewed").length);
    byId("report-list").innerHTML = submissions.length ? submissions.map((item) => `<div class="result-item"><div><strong>${esc(item.student)} · ${esc(item.exam)}</strong><small>${esc(item.status)} · ${esc(item.submitted)}</small></div><span class="score">${Number(item.marks)}/${Number(item.total)}</span></div>`).join("") : '<div class="empty-state">No results available yet.</div>';
  }

  function renderAnnouncements() {
    byId("announcement-list").innerHTML = announcements.length ? announcements.map((item) => `<div class="activity-item"><div style="flex:1"><strong>${esc(item.title)}</strong><small>${esc(item.body)} · ${esc(item.date)}</small></div><div class="actions-cell"><button class="btn btn-secondary btn-sm" type="button" data-edit-announcement="${esc(item.id)}">Edit</button><button class="btn btn-danger btn-sm" type="button" data-delete-announcement="${esc(item.id)}">Delete</button></div></div>`).join("") : '<div class="empty-state">No announcements yet. Post one above.</div>';
  }

  function save() {
    app.write("exams", exams);
    app.write("questions", questions);
    app.write("submissions", submissions);
    app.write("announcements", announcements);
    app.write("results", results);
  }

  document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => document.querySelector(button.dataset.scroll).scrollIntoView({ behavior: "smooth" })));
  byId("exam-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const intent = event.submitter?.value || "Published";
    exams.unshift({ id: "EX-" + Date.now().toString().slice(-6), title: data.get("title").trim(), subject: data.get("subject").trim(), description: data.get("description").trim(), instructions: data.get("instructions").trim(), date: data.get("date"), time: data.get("time"), duration: Number(data.get("duration")), marks: Number(data.get("marks")), questionType: data.get("questionType"), className: data.get("className"), status: intent });
    save();
    renderExams();
    app.toast(`Exam ${intent === "Draft" ? "saved as a draft" : "published"} in your local demo schedule.`);
    form.reset();
  });

  byId("question-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    questions.unshift({ id: "Q-" + Date.now().toString().slice(-6), prompt: data.get("prompt").trim(), subject: data.get("subject").trim(), type: data.get("type"), difficulty: data.get("difficulty") });
    save();
    renderQuestions();
    form.reset();
    app.toast("Question added to the local demo bank.");
  });

  document.addEventListener("click", (event) => {
    const editQuestion = event.target.closest("[data-edit-question]");
    const deleteQuestion = event.target.closest("[data-delete-question]");
    const editAnnouncement = event.target.closest("[data-edit-announcement]");
    const deleteAnnouncement = event.target.closest("[data-delete-announcement]");
    const review = event.target.closest("[data-save-review]");
    if (editQuestion) {
      const item = questions.find((question) => question.id === editQuestion.dataset.editQuestion);
      const prompt = window.prompt("Edit question prompt:", item.prompt);
      if (prompt === null) return;
      if (!prompt.trim()) { app.toast("Question prompt cannot be empty.", "error"); return; }
      item.prompt = prompt.trim();
      save(); renderQuestions(); app.toast("Question updated.");
    } else if (deleteQuestion) {
      if (!window.confirm("Delete this question from the local demo bank?")) return;
      questions.splice(questions.findIndex((item) => item.id === deleteQuestion.dataset.deleteQuestion), 1);
      save(); renderQuestions(); app.toast("Question deleted.");
    } else if (review) {
      const item = submissions.find((submission) => submission.id === review.dataset.saveReview);
      const input = document.querySelector(`[data-marks="${CSS.escape(item.id)}"]`);
      const marks = Number(input.value);
      if (!Number.isFinite(marks) || marks < 0 || marks > Number(item.total)) { app.toast(`Marks must be between 0 and ${item.total}.`, "error"); input.focus(); return; }
      item.marks = marks;
      item.status = "Reviewed";
      const result = {
        id: item.id,
        submissionId: item.id,
        student: item.student,
        exam: item.exam,
        date: item.submitted,
        score: marks,
        total: Number(item.total),
        percentage: Number(item.total) > 0 ? marks / Number(item.total) * 100 : 0
      };
      const resultIndex = results.findIndex((entry) => entry.submissionId === item.id);
      if (resultIndex === -1) results.push(result);
      else results[resultIndex] = result;
      save(); renderSubmissions(); app.toast("Review and marks saved to local demo data.");
    } else if (editAnnouncement) {
      const item = announcements.find((notice) => notice.id === editAnnouncement.dataset.editAnnouncement);
      const title = window.prompt("Edit announcement title:", item.title);
      if (title === null) return;
      if (!title.trim()) { app.toast("Announcement title cannot be empty.", "error"); return; }
      const body = window.prompt("Edit announcement message:", item.body);
      if (body === null) return;
      if (!body.trim()) { app.toast("Announcement message cannot be empty.", "error"); return; }
      item.title = title.trim(); item.body = body.trim();
      save(); renderAnnouncements(); app.toast("Announcement updated.");
    } else if (deleteAnnouncement) {
      if (!window.confirm("Delete this announcement from the local demo?")) return;
      announcements.splice(announcements.findIndex((item) => item.id === deleteAnnouncement.dataset.deleteAnnouncement), 1);
      save(); renderAnnouncements(); app.toast("Announcement deleted.");
    }
  });

  byId("announcement-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    announcements.unshift({ id: "AN-" + Date.now().toString().slice(-6), title: data.get("title").trim(), body: data.get("body").trim(), date: new Date().toISOString().slice(0, 10) });
    save(); renderAnnouncements(); form.reset(); app.toast("Announcement added to this browser’s demo data.");
  });

  byId("result-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const score = Number(data.get("score"));
    const total = Number(data.get("total"));
    if (score < 0 || total <= 0 || score > total) {
      app.toast("Score must be between 0 and the total marks.", "error");
      byId("result-score").focus();
      return;
    }
    const id = "RS-" + Date.now().toString().slice(-8);
    const date = data.get("date");
    const result = {
      id,
      submissionId: id,
      student: data.get("student").trim(),
      exam: data.get("exam").trim(),
      date,
      score,
      total,
      percentage: score / total * 100
    };
    results.unshift(result);
    submissions.unshift({ id, student: result.student, exam: result.exam, submitted: date, marks: score, total, status: "Reviewed" });
    save();
    renderSubmissions();
    form.reset();
    app.toast("Result saved. It is now available in student analytics.");
  });

  byId("export-csv").addEventListener("click", () => {
    const columns = ["Submission ID", "Student", "Exam", "Submitted", "Marks", "Total", "Review status"];
    const rows = submissions.map((item) => [item.id, item.student, item.exam, item.submitted, item.marks, item.total, item.status]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "campusexam-demo-submissions.csv"; link.click();
    URL.revokeObjectURL(url);
    app.toast("Sample submissions exported as CSV.");
  });
  byId("question-search").addEventListener("input", renderQuestions);
  byId("question-filter").addEventListener("change", renderQuestions);
  byId("student-status-filter").addEventListener("change", renderStudents);
  byId("global-search").addEventListener("input", renderStudents);

  renderExams(); renderQuestions(); renderStudents(); renderSubmissions(); renderAnnouncements();
})();
