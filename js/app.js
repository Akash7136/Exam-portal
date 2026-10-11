(function () {
  "use strict";

  const seed = { exams: [], questions: [], announcements: [], students: [], faculty: [], submissions: [], results: [], practiceSubmissions: [], activities: [], subjects: [], departments: [], logs: [], roles: [] };

  const storageVersion = "campusexam.emptyRecordsVersion";
  if (localStorage.getItem(storageVersion) !== "1") {
    ["exams", "questions", "announcements", "students", "faculty", "submissions", "results", "practiceSubmissions", "activities", "subjects", "departments", "logs", "roles", "examState"].forEach((key) => localStorage.removeItem("campusexam." + key));
    localStorage.setItem(storageVersion, "1");
  }

  function read(key) {
    const raw = localStorage.getItem("campusexam." + key);
    if (raw === null) return structuredClone(seed[key] || []);
    try { return JSON.parse(raw); }
    catch (error) {
      console.error("CampusExam could not read saved " + key + " data.", error);
      return structuredClone(seed[key] || []);
    }
  }

  function write(key, value) {
    localStorage.setItem("campusexam." + key, JSON.stringify(value));
  }

  function localDateKey(date) {
    const value = date || new Date();
    return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, "0"), String(value.getDate()).padStart(2, "0")].join("-");
  }

  function getLearningStreak() {
    const activityDates = read("activities");
    const dates = new Set((Array.isArray(activityDates) ? activityDates : []).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)));
    const today = localDateKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    let cursor = dates.has(today) ? new Date(today + "T12:00:00") : yesterdayDate;
    if (!dates.has(localDateKey(cursor))) return 0;
    let streak = 0;
    while (dates.has(localDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function recordLearningActivity() {
    const storedDates = read("activities");
    const dates = new Set(Array.isArray(storedDates) ? storedDates : []);
    dates.add(localDateKey());
    write("activities", Array.from(dates).sort());
    return getLearningStreak();
  }

  function toast(message, type) {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.append(region);
    }
    const item = document.createElement("div");
    item.className = "toast " + (type || "success");
    item.textContent = message;
    region.append(item);
    window.setTimeout(() => item.remove(), 3600);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function icon(name) {
    const paths = {
      grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
      calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
      chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
      code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6m6-16-4 20"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
      logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
      help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01"/>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.grid) + "</svg>";
  }

  function initShell() {
    document.querySelectorAll("[data-icon]").forEach((node) => { node.innerHTML = icon(node.dataset.icon); });
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".mobile-overlay");
    const menu = document.querySelector(".mobile-menu");
    if (sidebar && menu) {
      const closeMenu = () => { sidebar.classList.remove("open"); overlay?.classList.remove("open"); };
      menu.addEventListener("click", () => { sidebar.classList.toggle("open"); overlay?.classList.toggle("open"); });
      overlay?.addEventListener("click", closeMenu);
      sidebar.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    }
    document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", () => {
      localStorage.removeItem("campusexam.session");
      window.location.href = "login.html";
    }));
    document.querySelectorAll("[data-notifications]").forEach((button) => button.addEventListener("click", () => toast("You’re all caught up on your demo notifications.")));
    document.querySelectorAll("[data-profile]").forEach((button) => button.addEventListener("click", () => {
      const profile = document.getElementById("profile");
      if (profile) profile.scrollIntoView({ behavior: "smooth" });
      else toast("Profile details are part of this local demonstration.");
    }));
    const session = JSON.parse(localStorage.getItem("campusexam.session") || "null");
    if (session) {
      document.querySelectorAll("[data-session-name]").forEach((node) => { node.textContent = session.name; });
      document.querySelectorAll("[data-session-role]").forEach((node) => { node.textContent = session.role; });
      document.querySelectorAll("[data-session-initials]").forEach((node) => { node.textContent = session.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(); });
      document.querySelectorAll("[data-session-email]").forEach((node) => { node.textContent = session.email; });
    }
    const pageSections = Array.from(document.querySelectorAll("[data-page]"));
    if (pageSections.length) {
      const pageLinks = Array.from(document.querySelectorAll(".sidebar-nav a[href^='#']"));
      const hashLinks = Array.from(document.querySelectorAll("a[href^='#']"));
      const validPages = new Set(pageSections.map((section) => section.dataset.page));
      function showPage(page, updateHistory) {
        const selected = validPages.has(page) ? page : "overview";
        document.body.dataset.activePage = selected;
        pageSections.forEach((section) => { section.hidden = section.dataset.page !== selected; });
        document.querySelectorAll("[data-page-layout]").forEach((layout) => {
          const sections = Array.from(layout.querySelectorAll("[data-page]"));
          layout.hidden = sections.length > 0 && sections.every((section) => section.hidden);
          layout.classList.toggle("single-page-item", sections.filter((section) => !section.hidden).length === 1);
        });
        pageLinks.forEach((link) => link.classList.toggle("active", link.hash.slice(1) === selected || pageSections.some((section) => section.dataset.page === selected && section.id && link.hash === "#" + section.id)));
        if (updateHistory) history.pushState({ dashboardPage: selected }, "", "#" + selected);
        window.scrollTo(0, 0);
      }
      hashLinks.forEach((link) => link.addEventListener("click", (event) => {
        const page = pageSections.find((section) => section.id === link.hash.slice(1))?.dataset.page;
        if (!page) return;
        event.preventDefault();
        showPage(page, true);
      }));
      document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => {
        const selector = button.dataset.scroll;
        const page = pageSections.find((section) => "#" + section.id === selector)?.dataset.page;
        if (page) showPage(page, true);
      }));
      window.addEventListener("popstate", () => showPage(decodeURIComponent(location.hash.slice(1)), false));
      window.addEventListener("hashchange", () => showPage(decodeURIComponent(location.hash.slice(1)), false));
      showPage(decodeURIComponent(location.hash.slice(1)), false);
    }
  }

  window.CampusExam = { read, write, toast, escapeHTML, icon, initShell, getLearningStreak, recordLearningActivity, seed };
  document.addEventListener("DOMContentLoaded", initShell);
})();
