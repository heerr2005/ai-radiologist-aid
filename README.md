# 🩻 RadiologyAI — AI-Powered Medical Imaging Assistant

<div align="center">

![RadiologyAI Banner](https://img.shields.io/badge/RadiologyAI-Medical%20Imaging-blue?style=for-the-badge&logo=stethoscope)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-radiologist-aid.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-96.6%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**An AI-powered radiologist aid platform for intelligent medical image analysis and reporting.**

[🔗 Live Demo](https://ai-radiologist-aid.vercel.app/) · [🐛 Report Bug](https://github.com/heerr2005/ai-radiologist-aid/issues) · [✨ Request Feature](https://github.com/heerr2005/ai-radiologist-aid/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## 🧠 About the Project

**RadiologyAI** is a web-based AI assistant designed to support radiologists and medical professionals in analyzing medical images. The platform leverages artificial intelligence to provide preliminary insights, structured reports, and image annotations — helping clinicians work faster and more accurately.

> ⚠️ **This tool is intended as a decision-support system only and does not replace professional medical diagnosis.**

---

## ✨ Features

- 🔬 **AI-Powered Image Analysis** — Upload and analyze radiology images (X-rays, CT scans, MRIs) using AI models
- 📝 **Automated Report Generation** — Generate structured radiology reports from image analysis results
- 📄 **PDF Export** — Export findings and reports as downloadable PDF files using `jsPDF` and `html2canvas`
- 📊 **Dashboard & Analytics** — View analysis history and trends with interactive charts powered by Recharts
- 🔐 **Authentication & User Management** — Secure login and session management via Supabase Auth
- 🌙 **Dark / Light Mode** — Supports system-level and manual theme switching via `next-themes`
- 📱 **Responsive Design** — Fully responsive UI built with Tailwind CSS and Radix UI components
- ⚡ **Real-time Data** — Live data sync powered by Supabase and TanStack Query
- 🧾 **Markdown Rendering** — Rich text report display using `react-markdown`

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS, tailwindcss-animate |
| **UI Components** | Radix UI, shadcn/ui |
| **State & Data Fetching** | TanStack React Query |
| **Routing** | React Router DOM v6 |
| **Forms** | React Hook Form + Zod |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **Charts** | Recharts |
| **PDF Export** | jsPDF + html2canvas |
| **Markdown** | react-markdown |
| **Testing** | Vitest + Playwright |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
ai-radiologist-aid/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level route components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and helpers
│   ├── integrations/        # Supabase client and API integrations
│   └── main.tsx             # Application entry point
├── supabase/
│   └── migrations/          # Database migration files (PLpgSQL)
├── .env                     # Environment variables (do not commit secrets)
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) account and project

---

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/heerr2005/ai-radiologist-aid.git
cd ai-radiologist-aid
```

2. **Install dependencies**

```bash
npm install
# or
bun install
```

---

### Environment Variables

Create a `.env` file in the root of the project and add the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

You can find these values in your [Supabase project dashboard](https://app.supabase.com/) under **Settings → API**.

> ⚠️ Never commit real credentials or secret keys to version control.

---

### Running Locally

Start the development server:

```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`.

**Other available scripts:**

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

---

## 🌐 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Fork this repository
2. Import the repo into [Vercel](https://vercel.com/)
3. Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy!

Vercel automatically handles build configuration via `vercel.json`.

---

## 🧪 Testing

This project uses two testing frameworks:

**Unit Tests (Vitest)**
```bash
npm run test
```

**End-to-End Tests (Playwright)**
```bash
npx playwright test
```

Playwright configuration is defined in `playwright.config.ts`.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code passes lint checks (`npm run lint`) before submitting.

---

## 📜 License

This project is open source. See the repository for license details.

---

## ⚕️ Disclaimer

> **RadiologyAI is a decision-support tool and is NOT a certified medical device.**
> All AI-generated analysis and reports are intended to assist — not replace — qualified medical professionals. Always consult a licensed radiologist or physician for clinical decisions.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/heerr2005">heerr2005</a> · 
  <a href="https://ai-radiologist-aid.vercel.app/">Live Demo</a>
</div>
