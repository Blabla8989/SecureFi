# 🛡️ SecureFi - Cyberpunk Personal Finance Tracker

**SecureFi** is a modern, lightweight, and highly secure personal finance management application. Built with a focus on real-time data synchronization and user privacy, it features a sleek "Cyberpunk/Terminal" inspired user interface optimized for both desktop and mobile devices.

![SecureFi UI](https://img.shields.io/badge/UI-Cyberpunk_Theme-00ffcc?style=flat-square)
![Database](https://img.shields.io/badge/Database-Firebase_Firestore-FFCA28?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-Firebase_Authentication-F58220?style=flat-square)

---

## ✨ Key Features

*   **Real-time Synchronization:** Instantly updates balances, transaction lists, and charts without reloading the page using Firestore `onSnapshot`.
*   **Interactive Data Visualization:** Integrates `Chart.js` for dynamic doughnut charts categorizing expenses.
*   **Advanced Data Filtering:** Sort and analyze transactions by predefined timeframes (This Week, This Month, This Year) or custom date ranges.
*   **Single Page Application (SPA) Routing:** Smooth, flick-free navigation between the Dashboard and Report views.
*   **Fully Responsive:** CSS Grid and Flexbox architecture ensures 100% compatibility across desktop and mobile screens.

## 🔒 Security & Privacy Focus (DevSecOps Approach)

As a cybersecurity-oriented project, SecureFi implements strict data protection mechanisms:
*   **Email Verification Guard:** Accounts cannot access the application until the email address is explicitly verified via a secure Firebase token link.
*   **Route Protection:** Unauthorized users attempting to access internal views (e.g., `report.html`) are immediately intercepted and redirected to the authentication gate.
*   **Data Isolation (Firestore Security Rules):** Database rules strictly enforce that users can only read, write, update, or delete documents containing their specific `userId`.
*   **Environment Security:** No sensitive backend logic is exposed to the client. Cloud infrastructure handles all authentication states.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox, Grid), Vanilla JavaScript (ES6 Modules).
*   **Backend & BaaS:** Google Firebase (Authentication, Cloud Firestore).
*   **Libraries:** [Chart.js](https://www.chartjs.org/) (Data Visualization), [Lucide Icons](https://lucide.dev/) (SVG Iconography).

## 🚀 Getting Started

To run this project locally for development or testing:

1. Clone the repository:
   ```bash
   git clone [https://github.com/Blabla8989/SecureFi.git](https://github.com/Blabla8989/SecureFi.git)