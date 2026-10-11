(function () {
  "use strict";
  const app = window.CampusExam;
  const editor = document.getElementById("code-editor");
  const highlight = document.getElementById("highlighted-code");
  const language = document.getElementById("language-select");
  const runButton = document.getElementById("run-code");
  const submitButton = document.getElementById("submit-solution");
  const challenges = app.read("questions")
    .filter((question) => question.type === "Programming")
    .map((question) => ({
      id: question.id,
      title: question.subject,
      prompt: question.prompt,
      difficulty: question.difficulty
    }));
  const submissions = app.read("practiceSubmissions");
  let difficulty = "All";
  let current = null;
  let dirty = false;

  function renderHighlights() {
    const escaped = editor.value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
    const marked = escaped.replace(/(\/\/[^\n]*|#[^\n]*)|(("[^"]*"|'[^']*'))|\b(\d+)\b|\b(class|static|return|int|long|if|else|while|for|def|true|false|using|namespace|include|const|vector|String|boolean|public|void|new)\b|\b([A-Za-z_]\w*)(?=\s*\()/g,
      (match, comment, _stringGroup, string, number, keyword, fn) => {
        if (comment) return `<span class="token-comment">${comment}</span>`;
        if (string) return `<span class="token-string">${string}</span>`;
        if (number) return `<span class="token-number">${number}</span>`;
        if (keyword) return `<span class="token-keyword">${keyword}</span>`;
        if (fn) return `<span class="token-function">${fn}</span>`;
        return match;
      });
    highlight.innerHTML = marked + (editor.value.endsWith("\n") ? " " : "");
    highlight.parentElement.scrollTop = editor.scrollTop;
    highlight.parentElement.scrollLeft = editor.scrollLeft;
  }

  function visibleChallenges() {
    return challenges.filter((question) => difficulty === "All" || question.difficulty === difficulty);
  }

  function renderChallengeList() {
    const visible = visibleChallenges();
    document.getElementById("challenge-list").innerHTML = visible.length
      ? visible.map((question) => `<button class="challenge-item ${current && question.id === current.id ? "active" : ""}" type="button" data-challenge="${app.escapeHTML(question.id)}"><span><strong>${app.escapeHTML(question.title)}</strong><small>${app.escapeHTML(question.difficulty)} · ${app.escapeHTML(question.prompt)}</small></span><span class="badge badge-gray">${app.escapeHTML(question.difficulty)}</span></button>`).join("")
      : '<div class="empty-state">No exercises available.</div>';
  }

  function selectChallenge(challenge) {
    current = challenge;
    dirty = false;
    const saved = submissions.find((submission) => submission.questionId === challenge.id);
    editor.value = saved ? saved.code : "";
    document.getElementById("challenge-title").textContent = challenge.title;
    document.getElementById("challenge-difficulty").textContent = challenge.difficulty || "Not set";
    document.getElementById("challenge-points").textContent = "";
    document.getElementById("challenge-description").textContent = challenge.prompt;
    document.getElementById("exercise-subject").textContent = challenge.title;
    document.getElementById("exercise-tests").textContent = "None assigned";
    document.getElementById("test-summary").textContent = saved
      ? "Your solution is saved locally. Code was not compiled or executed."
      : "Code execution is not available in this browser.";
    document.getElementById("test-status").textContent = saved ? "Saved" : "Not run";
    document.getElementById("test-status").className = saved ? "badge badge-green" : "badge badge-gray";
    document.getElementById("test-cases").innerHTML = '<div class="empty-state">No test cases are assigned to this exercise.</div>';
    runButton.disabled = false;
    submitButton.disabled = false;
    renderChallengeList();
    renderHighlights();
  }

  document.getElementById("challenge-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-challenge]");
    if (!button) return;
    if (dirty && editor.value.trim() && !window.confirm("Discard the unsaved solution and open another exercise?")) return;
    const challenge = challenges.find((question) => question.id === button.dataset.challenge);
    if (challenge) selectChallenge(challenge);
  });

  document.querySelector(".difficulty-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-difficulty]");
    if (!button) return;
    difficulty = button.dataset.difficulty;
    document.querySelectorAll("[data-difficulty]").forEach((item) => item.classList.toggle("active", item === button));
    renderChallengeList();
  });

  editor.addEventListener("input", () => { dirty = true; renderHighlights(); });
  editor.addEventListener("scroll", renderHighlights);
  editor.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    editor.setRangeText("    ", editor.selectionStart, editor.selectionEnd, "end");
    dirty = true;
    renderHighlights();
  });

  runButton.addEventListener("click", () => {
    if (!current) return;
    document.getElementById("test-summary").textContent = "Code execution is not available in this browser; no code was run.";
    document.getElementById("test-status").textContent = "Not run";
    app.toast("No code was compiled or executed. A browser compiler is not configured.", "error");
  });

  submitButton.addEventListener("click", () => {
    if (!current) return;
    if (!editor.value.trim()) {
      app.toast("Enter a solution before saving.", "error");
      editor.focus();
      return;
    }
    const submission = { questionId: current.id, code: editor.value, language: language.value, submittedAt: new Date().toISOString() };
    const existing = submissions.findIndex((item) => item.questionId === current.id);
    if (existing === -1) submissions.push(submission);
    else submissions[existing] = submission;
    app.write("practiceSubmissions", submissions);
    app.recordLearningActivity();
    dirty = false;
    document.getElementById("test-summary").textContent = "Your solution is saved locally. Code was not compiled or executed.";
    document.getElementById("test-status").textContent = "Saved";
    document.getElementById("test-status").className = "badge badge-green";
    app.toast("Solution saved in this browser. It has not been executed or graded.");
  });

  document.getElementById("clear-code").addEventListener("click", () => {
    editor.value = "";
    dirty = true;
    renderHighlights();
    editor.focus();
  });
  document.getElementById("reset-code").addEventListener("click", () => {
    if (editor.value && !window.confirm("Clear your current solution?")) return;
    editor.value = "";
    dirty = false;
    renderHighlights();
  });

  if (challenges.length) selectChallenge(challenges[0]);
  else {
    document.getElementById("challenge-list").innerHTML = '<div class="empty-state">No programming exercises are available. Add a programming question in the faculty question bank.</div>';
    document.getElementById("test-cases").innerHTML = '<div class="empty-state">No exercise selected.</div>';
    runButton.disabled = true;
    submitButton.disabled = true;
    renderHighlights();
  }
  renderChallengeList();
})();
