(function () {
  "use strict";
  localStorage.removeItem("campusexam.examState");
  const params = new URLSearchParams(window.location.search);
  const examId = params.get("id");
  const exam = window.CampusExam.read("exams").find((item) => item.id === examId && item.status === "Published");
  if (!exam) return;

  document.getElementById("exam-empty-eyebrow").textContent = "PUBLISHED EXAM";
  document.getElementById("exam-empty-title").textContent = exam.title;
  document.getElementById("exam-empty-description").textContent = "This exam has been published, but it does not have any questions assigned yet.";
  const details = document.getElementById("exam-empty-details");
  const date = new Date(exam.date + "T" + (exam.time || "00:00") + ":00");
  details.textContent = [exam.subject, date.toLocaleString(), `${Number(exam.duration)} minutes`, `${Number(exam.marks)} marks`].filter(Boolean).join(" · ");
  details.hidden = false;
})();
