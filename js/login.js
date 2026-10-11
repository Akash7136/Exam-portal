(function () {
  "use strict";
  const accounts = {
    "student@demo.com": { role: "student", name: "Student" },
    "faculty@demo.com": { role: "faculty", name: "Faculty" },
    "admin@demo.com": { role: "admin", name: "Admin" }
  };
  const form = document.getElementById("login-form");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const error = document.getElementById("login-error");
  const button = document.getElementById("login-button");
  document.getElementById("toggle-password").addEventListener("click", function () {
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    this.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    this.innerHTML = visible ? "◉" : "◎";
  });
  document.getElementById("forgot-password").addEventListener("click", (event) => {
    event.preventDefault();
    error.textContent = "Password recovery is not available in this frontend demo.";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    const address = email.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      error.textContent = "Enter a valid email address.";
      email.focus();
      return;
    }
    if (password.value.length < 1) {
      error.textContent = "Enter your password to continue.";
      password.focus();
      return;
    }
    button.disabled = true;
    button.textContent = "Signing in…";
    window.setTimeout(() => {
      const account = accounts[address];
      if (account && password.value === "Demo123!") {
        let role = account.role;
        const assignments = JSON.parse(localStorage.getItem("campusexam.roles") || "null");
        const savedAssignment = Array.isArray(assignments) && assignments.find((item) => item.email === address);
        if (savedAssignment && ["student", "faculty", "admin"].includes(savedAssignment.role)) role = savedAssignment.role;
        localStorage.setItem("campusexam.session", JSON.stringify({ email: address, role, name: account.name }));
        window.location.href = role + "-dashboard.html";
        return;
      }
      error.textContent = "Email or password is incorrect.";
      button.disabled = false;
      button.textContent = "Login";
      password.focus();
    }, 550);
  });
})();
