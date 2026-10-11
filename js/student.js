(function () {
  "use strict";
  const app = window.CampusExam;
  const search = document.getElementById("global-search");
  const exams = app.read("exams");
  const practiceSubmissions = app.read("practiceSubmissions");
  const storedResults = app.read("results");
  const results = Array.isArray(storedResults) ? storedResults : [];
  document.getElementById("solved-count").textContent = String(Array.isArray(practiceSubmissions) ? practiceSubmissions.length : 0);

  function renderStreak() {
    const streak = app.getLearningStreak();
    document.getElementById("learning-streak").textContent = `🔥 ${streak}-day streak`;
    document.getElementById("streak-caption").textContent = streak
      ? "Keep learning to continue your streak"
      : "Complete a practice activity to begin";
  }

  function renderResults() {
    const ordered = results.slice().sort((a, b) => String(b.date || b.submitted || "").localeCompare(String(a.date || a.submitted || "")));
    const list = document.getElementById("recent-results");
    list.innerHTML = ordered.length
      ? ordered.slice(0, 5).map((result) => {
        const title = result.exam || result.title || "Exam";
        const score = Number(result.score ?? result.marks);
        const total = Number(result.total);
        const date = result.date || result.submitted || "";
        return `<div class="result-item"><div><strong>${app.escapeHTML(title)}</strong><small>${app.escapeHTML(date)}</small></div><span class="score">${Number.isFinite(score) ? score : 0}/${Number.isFinite(total) ? total : 0}</span></div>`;
      }).join("")
      : '<div class="empty-state">No results yet.</div>';

    const scored = ordered.map((result) => {
      const score = Number(result.score ?? result.marks);
      const total = Number(result.total);
      const hasPercentage = result.percentage !== null && result.percentage !== undefined && result.percentage !== "";
      const percentage = hasPercentage && Number.isFinite(Number(result.percentage)) ? Number(result.percentage) : (total > 0 ? score / total * 100 : NaN);
      return { ...result, percentage };
    }).filter((result) => Number.isFinite(result.percentage) && result.percentage >= 0 && result.percentage <= 100)
      .sort((a, b) => String(a.date || a.submitted || "").localeCompare(String(b.date || b.submitted || "")));
    const average = scored.length ? Math.round(scored.reduce((sum, result) => sum + result.percentage, 0) / scored.length) : null;
    document.getElementById("average-score").textContent = average === null ? "—" : `${average}%`;
    document.getElementById("best-score").textContent = scored.length
      ? `${Math.round(Math.max(...scored.map((result) => result.percentage)))}%`
      : "—";
    const trend = document.getElementById("performance-trend");
    if (!scored.length) {
      trend.textContent = "Awaiting results";
      trend.className = "badge badge-gray";
    } else if (scored.length === 1) {
      trend.textContent = "1 result recorded";
      trend.className = "badge badge-blue";
    } else {
      const change = Math.round(scored[scored.length - 1].percentage - scored[scored.length - 2].percentage);
      trend.textContent = `${change > 0 ? "↑ +" : change < 0 ? "↓ " : ""}${change}% vs. previous`;
      trend.className = `badge ${change > 0 ? "badge-green" : change < 0 ? "badge-amber" : "badge-gray"}`;
    }
    renderPerformanceChart(scored);
  }

  function renderPerformanceChart(data) {
    const container = document.getElementById("performance-chart");
    if (!data.length) {
      container.innerHTML = '<div class="empty-state">Your performance graph will appear after results are available.</div>';
      return;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 720 390");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Exam performance graph with exam names on the horizontal axis and percentages on the vertical axis");
    const left = 56;
    const right = 20;
    const top = 28;
    const bottom = 300;
    const width = 720 - left - right;
    const height = bottom - top;
    const make = (tag, attrs, text) => {
      const element = document.createElementNS(svgNS, tag);
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
      if (text) element.textContent = text;
      svg.append(element);
      return element;
    };

    [0, 25, 50, 75, 100].forEach((value) => {
      const y = bottom - value / 100 * height;
      make("line", { x1: left, y1: y, x2: 720 - right, y2: y, class: "performance-grid-line" });
      make("text", { x: left - 10, y: y + 4, "text-anchor": "end", class: "performance-axis-label" }, `${value}%`);
    });
    make("line", { x1: left, y1: top, x2: left, y2: bottom, class: "performance-axis-line" });
    make("line", { x1: left, y1: bottom, x2: 720 - right, y2: bottom, class: "performance-axis-line" });

    const points = data.map((result, index) => ({
      result,
      x: data.length === 1 ? left + width / 2 : left + index * width / (data.length - 1),
      y: bottom - result.percentage / 100 * height
    }));
    if (points.length > 1) {
      make("polygon", {
        points: `${points[0].x},${bottom} ${points.map((point) => `${point.x},${point.y}`).join(" ")} ${points[points.length - 1].x},${bottom}`,
        class: "performance-area"
      });
    }
    if (points.length > 1) {
      make("polyline", { points: points.map((point) => `${point.x},${point.y}`).join(" "), class: "performance-line" });
    }
    points.forEach(({ result, x, y }) => {
      const circle = make("circle", { cx: x, cy: y, r: 5, class: "performance-point" });
      const title = document.createElementNS(svgNS, "title");
      title.textContent = `${result.exam || result.title || "Exam"}: ${Math.round(result.percentage)}%`;
      circle.append(title);
      make("text", { x, y: Math.max(top + 14, y - 12), "text-anchor": "middle", class: "performance-value-label" }, `${Math.round(result.percentage)}%`);
      const rawName = result.exam || result.title || "Exam";
      const label = rawName.length > 15 ? rawName.slice(0, 14) + "…" : rawName;
      make("text", { x, y: bottom + 24, "text-anchor": "middle", class: "performance-axis-label" }, label);
      const date = result.date || result.submitted || "";
      if (date) make("text", { x, y: bottom + 42, "text-anchor": "middle", class: "performance-date-label" }, date.slice(5));
    });
    container.replaceChildren(svg);
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = exams.filter((exam) => ["Published", "Scheduled"].includes(exam.status) && exam.date >= today);
  document.getElementById("upcoming-count").textContent = String(upcoming.length);
  document.getElementById("completed-count").textContent = String(new Set(results.map((result) => result.exam || result.title || result.id)).size);
  if (upcoming.length) {
    const rows = upcoming.map((exam) => {
      const date = new Date(exam.date + "T00:00:00");
      const month = date.toLocaleString(undefined, { month: "short" });
      const details = [exam.subject, `${exam.duration} min`, `${exam.marks} marks`].filter(Boolean).join(" · ");
      return `<article class="exam-row" data-search="${app.escapeHTML(exam.title + " " + exam.subject)}"><div class="date-box"><strong>${date.getDate()}</strong><span>${month}</span></div><div><h3>${app.escapeHTML(exam.title)}</h3><p>${app.escapeHTML(details)}</p></div><a class="btn btn-primary" href="exam.html?id=${encodeURIComponent(exam.id)}">View exam</a></article>`;
    }).join("");
    document.getElementById("upcoming-exams").innerHTML = rows;
    document.getElementById("exam-schedule-list").innerHTML = upcoming.map((exam) => {
      const date = new Date(exam.date + "T" + (exam.time || "00:00") + ":00");
      return `<a class="quick-link" data-search="${app.escapeHTML(exam.title + " " + exam.subject)}" href="exam.html?id=${encodeURIComponent(exam.id)}"><span class="stat-icon">${app.icon("calendar")}</span><span><strong>${app.escapeHTML(date.toLocaleDateString(undefined, { month: "short", day: "numeric" }))} · ${app.escapeHTML(exam.title)}</strong><small>${app.escapeHTML(exam.time || "Time not set")} · ${Number(exam.duration)} minutes</small></span></a>`;
    }).join("");
  }
  if (search) search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll("[data-search]").forEach((item) => {
      item.hidden = query !== "" && !((item.dataset.search || "") + " " + item.textContent).toLowerCase().includes(query);
    });
  });
  renderStreak();
  renderResults();
  window.addEventListener("storage", (event) => {
    if (event.key === "campusexam.activities") renderStreak();
    if (event.key === "campusexam.results") {
      refreshResults();
    }
  });

  function refreshResults() {
    const updatedResults = app.read("results");
    results.splice(0, results.length, ...(Array.isArray(updatedResults) ? updatedResults : []));
    renderResults();
  }

  window.addEventListener("focus", () => {
    renderStreak();
    refreshResults();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      renderStreak();
      refreshResults();
    }
  });
})();
