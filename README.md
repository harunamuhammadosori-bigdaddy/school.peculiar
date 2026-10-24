# Peculiar College Doma — School Portal & Website

Official website and school management portal for **Peculiar College Doma**, Nasarawa State, Nigeria.

> *"Knowledge, Character, and Excellence"* • *"Nurturing minds, building character, and raising leaders"*

---

## Features

- **Public Website**: School overview, history, facilities, curriculum, news & announcements, photo gallery, and contact desk.
- **Online Admissions**:
  - Full online application form with instant reference number generation (e.g. `PCD-2026-0001`).
  - **Public Application Status Tracking**: Track admission status without login using application reference number or phone number.
  - Printable official admission letter and application summary PDF.
- **Role-Based Portals**:
  - **Super Admin & Admin**: Full system management, user accounts, admissions processing, news CMS, photo gallery, and audit logs.
  - **Principal**: Oversight, student performance, reports, and communications.
  - **Teacher**: Student rosters, marks entry (CA + Exam), and automated grading.
  - **Accountant / Bursar**: School fee ledger, fee payment recording (bank transfer, cash, POS), and official receipt generation.
  - **Parent Portal**: View children's attendance, term report cards with PDF download, and fee balances with receipts.
  - **Student Portal**: View enrolled subjects, attendance, grades, and fee status.
- **Server-Side AI Assistant**: Powered by `@google/genai` (Gemini API) for drafting professional school announcements and parent communications.

---

## Local Development

### Prerequisites
- Node.js 20+ or 22+
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
- `MONGODB_URI`: (Optional) MongoDB Atlas connection string.
- `GEMINI_API_KEY`: (Optional) Google Gemini API key for server-side AI drafting.
- `JWT_SECRET`: (Optional) Secret key for signing authentication tokens (automatically generated in dev).

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Cloudflare

This repository is optimized for deployment on **Cloudflare Pages**.

### Cloudflare Pages Setup:
1. Push your repository to **GitHub**.
2. Go to **Cloudflare Dashboard** → **Compute (Workers & Pages)** → **Pages** → **Connect to Git**.
3. Select your repository `school.peculiar`.
4. Configure Build settings:
   - **Framework preset**: `Vite` (or None)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: In **Settings → Environment variables**, add `NODE_VERSION` = `22`.
5. Client-side routing is automatically handled by the included `public/_redirects` file (`/* /index.html 200`).
6. Click **Save and Deploy**.

---

## Scripts

- `npm run dev`: Starts the unified full-stack server on port 3000.
- `npm run build`: Builds the production frontend bundle and server output.
- `npm run lint`: Runs TypeScript validation (`tsc --noEmit`).
- `npm run test:security`: Executes security and RBAC authentication test suite.
