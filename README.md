# Modern Job Application Management System

JobPortal is a sleek, modern, full-stack Job Application Management System. Built with a React + Vite frontend and a Node.js + Express + SQLite backend, it offers three distinct dashboards tailored to different user roles: **Job Seekers**, **Employers**, and **System Administrators**. 

The app features dynamic styling, cohesive modern gradients, responsive interfaces, secure token-based JWT authentication, and a lightweight, self-initializing SQLite database.

---

## Key Features by User Role

### 1. Job Seeker Dashboard
*   **Search & Filter Jobs:** Live-search through all available job openings by title or description.
*   **Easy Applications:** Apply for jobs instantly by submitting standard or customized resume text.
*   **Track Status:** Real-time visibility into the status of all submitted applications (`PENDING`, `ACCEPTED`, or `REJECTED`).
*   **Professional Profiles:** Build and manage a professional profile including full name, biographical statement, skills (tags), and contact information (email, phone).

### 2. Employer Dashboard
*   **Post Job Openings:** Create new, detailed job listings complete with titles, descriptions, and statuses.
*   **Manage Applicants:** View all applicants for posted jobs. Drill down to inspect individual candidate profiles and resume text.
*   **Decision Matrix:** Accept or reject applications with instant visual feedback and dashboard state updates.
*   **Aggregated Reports:** Access full, structured tabular reports compiling jobs, applicant details, contact emails, skills, and application dates.

### 3. Administrator Dashboard
*   **System Activity Logs:** A central control panel tracking all job applications system-wide.
*   **Advanced SQL Audits:** Real-time logging powered by relational SQLite queries showing timestamp, candidate name, job title, and employer name.

---

## Technology Stack

| Layer | Technologies Used | Key Packages / Libraries |
| :--- | :--- | :--- |
| **Frontend** | React 19, HTML5, Vanilla CSS | `vite`, `react-router-dom`, `fetch API` |
| **Backend** | Node.js, Express.js | `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs` |
| **Database** | SQLite | `sqlite3` (persistent, self-initializing table schemas) |
| **Testing** | Playwright | `@playwright/test` (e2e happy path flows) |

---

## Project Structure

```text
job-portal/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Dashboards (JobSeeker, Employer, Admin)
│   │   ├── api.js          # Unified fetch-based API wrapper
│   │   ├── App.jsx         # App routing, login, registration, layout
│   │   ├── index.css       # Core design tokens and modern global styling
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express Backend API
│   ├── index.js            # Express routing, middleware integration, port binding
│   ├── db.js               # Database connector & self-initializing schema creation
│   ├── middleware.js       # JWT Verification middleware
│   ├── .env                # Server configuration (Port, JWT Secret)
│   ├── package.json
│   └── job_portal.db       # SQLite Database File (auto-generated)
│
├── tests/                  # Playwright End-to-End Integration Tests
│   └── job-portal.spec.js  # Playwright happy path test script
│
├── package.json            # Root scripts & dev dependencies (concurrently)
└── README.md               # Main project documentation
```

---

## Environment Variables

The backend relies on configuration parameters specified inside a `.env` file within the `server` directory.

Create or edit `server/.env`:
```env
JWT_SECRET=supersecretkey123
PORT=3000
```

*   `JWT_SECRET`: Secret key used for signing and verifying JSON Web Tokens.
*   `PORT`: The port on which the Express server listens.

---

## Installation & Setup

To get the application up and running locally, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v16.x or newer) and [npm](https://www.npmjs.com/) installed.

### 2. Install Dependencies
You must install dependencies for the root, the server, and the client.

**Option A: Quick installation from root (Recommended)**
```bash
# Installs root, client, and server dependencies in one command
npm install && npm install --prefix client && npm install --prefix server
```

**Option B: Manual step-by-step installation**
```bash
# Install root dependencies (concurrently, playwright)
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
cd ..
```

---

## Running the Application

There are two ways to boot up the backend API and the Vite frontend server:

### Option A: Concurrent Mode (Single Command)
Run both servers simultaneously from the root directory:
```bash
npm start
```
*   **Vite Frontend Development Server:** Launches at [http://localhost:5173](http://localhost:5173)
*   **Express Backend API Server:** Launches at [http://localhost:3000](http://localhost:3000)

### Option B: Separate Terminal Processes
If you prefer to inspect process outputs individually, run them in separate terminal tabs:

**Terminal 1 (Backend Server):**
```bash
cd server
node index.js
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

---

## Testing

The project includes an end-to-end (E2E) integration test suite written with **Playwright**. The test runs a complete registration, posting, application, status resolution, profile updating, and audit logging flow.

To execute the tests:

1.  Make sure the servers are **running** (either concurrently or individually).
2.  If you are running the test for the first time, install the required Playwright browser binaries:
    ```bash
    npx playwright install
    ```
3.  Execute the test suite from the root directory:
    ```bash
    npx playwright test
    ```
4.  To view the results via Playwright's HTML reporter:
    ```bash
    npx playwright show-report
    ```

---

## Demo Sign Up & User Roles

When running the application, there are three types of accounts you can easily sign up for directly from the Landing page:

1.  **Job Seeker:** Click `I'm a Job Seeker` on the landing page, register a username, and select a password.
2.  **Employer:** Click `I'm an Employer` on the landing page, register a username, and select a password.
3.  **Admin:** Click `Admin Demo` on the landing page, register a username, and select a password.

*Alternatively, you can choose any role manually during registration on the `/register` page using the role selector buttons.*

---

## Design Aesthetics & UI Details

The application features a sleek dark-themed interface built on vanilla CSS:
*   **Glassmorphism Effects:** Cards and menus leverage subtle border lines and translucent background backdrops for a premium feeling.
*   **Vibrant Gradients:** Accentuation elements (titles, buttons) feature custom linear-gradient fills (`#6366f1` to `#a855f7`).
*   **Responsive Forms:** Clean, modern input boxes with colored focus rings.
*   **Micro-interactions:** Transitions, disabled button behaviors, and loading states for a responsive application experience.


# Screenshots

## Home Screen
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/9d7c4034-c873-4a6c-9442-409b5a7769bf" />

## Registration Page
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/d8b679c7-6fc2-4da0-8550-b30c55a48dc0" />

## Job Posting as an Employer
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/2c4a221d-31da-4dee-a7ff-bfdbcee452c3" />

## Job listing 
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/d41f8c60-bc68-4b34-be4d-a89aef1315ad" />

## Registring as a Job Seeker
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/d8c13d13-61bb-4749-92d0-e8581db74908" />

## Job Seeker Dashboard
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/aab856f5-22f9-4a5e-b162-2e9876da9adf" />

## Applying to a Job
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/cfdc2ee8-1376-4379-95dc-1f173a063807" />

## Viewing Job Applications as an Employer
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/49e4624e-ca04-4eec-a33d-b36602ef773a" />

## Job Status update as a Job Seeker
<img width="1837" height="964" alt="image" src="https://github.com/user-attachments/assets/8a5a0213-270e-4ff7-b2c6-818c812e15f0" />
