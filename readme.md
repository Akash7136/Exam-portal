# CampusExam

CampusExam is a responsive college examination portal prototype built with plain HTML, CSS, and JavaScript. It is designed for GitHub Pages and VS Code Live Server; it does not need a server, build step, or package installation.

## Run locally

1. Open this folder in VS Code.
2. Open `index.html` with the Live Server extension (or open it directly in a browser).
3. Sign in with one of the demo accounts below.

| Demo role | Email / college ID |
| --- | --- |
| Student | `student@demo.com` |
| Faculty | `faculty@demo.com` |
| Admin | `admin@demo.com` |

The demo password for all three accounts is `Demo123!`. Role assignment is selected from the entered demo email solely to demonstrate navigation. This is not authentication: credentials are checked in browser JavaScript. Dashboards, assessments, and practice start with no preloaded records; items added through the interface stay in this browser's `localStorage`. On first load after this update, the app clears its older preloaded demonstration records. Do not enter real or sensitive information.

## Pages

- `login.html` — demo sign-in.
- `student-dashboard.html`, `faculty-dashboard.html`, `admin-dashboard.html` — role-specific dashboards and demo tools.
- `exam.html` — assessment landing page; an exam appears when one is available.
- `practice.html` — code editor interface; assigned exercises must be added before practice controls are enabled.

All pages use relative links and can be hosted as static files on GitHub Pages. Browser storage can be cleared to reset the demonstration data.

Dashboard sidebar items switch between one section at a time. Student results added through faculty submission review are saved locally and feed the student performance graph. Saving a programming exercise solution records a local learning activity date for the student's consecutive-day streak.
