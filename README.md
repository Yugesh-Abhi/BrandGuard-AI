# BrandGuard AI 🛡️✨

> **"Every piece of content. One consistent brand."**

BrandGuard AI is an enterprise-grade SaaS web application engineered to safeguard brand equity, enforce tone of voice consistency, detect prohibited corporate jargon, and prevent regulatory SLA and liability exposure before content is published.

---

## 🚀 Tech Stack

- **Frontend:** React.js 19 + Vite 8 (JavaScript)
- **Styling:** Tailwind CSS v4 (Custom Dark Navy & Purple Theme with glassmorphism effects)
- **Icons:** Lucide React
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security)
- **AI Engine Architecture:** Server-side secure LLM proxy pattern (OpenAI / Anthropic / Gemini API key shield)

---

## 🎨 Design Philosophy & Theme

- **Background:** Deep space navy (`#070913`, `#090D1C`)
- **Card Surfaces:** Polished slate-navy glass (`#0D1326`, `#121935`)
- **Primary Accents:** Deep purple (`#8B5CF6`), violet (`#A855F7`), and indigo (`#6366F1`)
- **Status Indicators:** Emerald (`#10B981`) for approved/compliant, Amber (`#F59E0B`) for warnings, Rose (`#F43F5E`) for critical SLA liabilities
- **Typography:** Modern clean sans-serif with subtle gradients and high-contrast readable hierarchy

---

## 📁 Project Structure

```
brandguard-ai/
├── server/
│   ├── schema.sql              # Supabase PostgreSQL schema (Tables, RLS policies, Foreign Keys)
│   └── llmProxyExample.js      # Server-side proxy reference protecting LLM API keys
├── src/
│   ├── components/
│   │   ├── auth/               # Split-screen SaaS Login & Registration with demo quick-picks
│   │   │   └── AuthPage.jsx
│   │   ├── common/             # Reusable UI component library
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ScoreMeter.jsx
│   │   │   └── StatCard.jsx
│   │   ├── dashboard/          # Main SaaS Dashboard (KPIs, Radar, Submissions, Live Feed)
│   │   │   └── DashboardPage.jsx
│   │   ├── guidelines/         # Tone sliders, Banned terms CRUD, Disclaimers, Taglines
│   │   │   └── BrandGuidelinesPage.jsx
│   │   ├── submission/         # Intake form with live word counter and preloaded test samples
│   │   │   └── ContentSubmissionPage.jsx
│   │   ├── analysis/           # Visual pulse scanner with multi-stage inspection milestones
│   │   │   └── ComplianceAnalysisPage.jsx
│   │   ├── report/             # Executive score, in-text highlighted viewer, AI suggested fixes
│   │   │   └── ComplianceReportPage.jsx
│   │   ├── reviews/            # Brand Governance sign-off queue and feedback thread
│   │   │   └── ReviewApprovalPage.jsx
│   │   ├── history/            # Version timeline, side-by-side diff comparison, and audit trail
│   │   │   └── RevisionHistoryPage.jsx
│   │   ├── analytics/          # 6-month compliance velocity, top recurring violations, department stats
│   │   │   └── AnalyticsPage.jsx
│   │   └── layout/             # Responsive layout with collapsible desktop sidebar & mobile drawer
│   │       ├── AppLayout.jsx
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx     # User authentication state & Supabase/Demo toggle
│   │   └── BrandContext.jsx    # Active brand workspace, guidelines, submissions, scan triggers
│   ├── data/
│   │   └── mockData.js         # Realistic enterprise datasets for Acme Global, Apex Wealth, Nova BioHealth
│   ├── services/
│   │   ├── analyticsService.js # Metrics & throughput data provider
│   │   ├── authService.js      # Supabase Auth client with local fallback
│   │   ├── brandService.js     # Brand workspace and guideline rules CRUD
│   │   ├── complianceService.js# Pluggable scanner (Deterministic rules + Server-side LLM proxy)
│   │   ├── contentService.js   # Submissions & review workflow manager
│   │   └── supabaseClient.js   # Supabase client initializer with status honesty detector
│   ├── App.jsx                 # View router and state orchestrator
│   ├── index.css               # Tailwind CSS v4 setup and custom scrollbars
│   └── main.jsx
├── .env.example                # Environment variables template
├── package.json
└── vite.config.js              # Vite configuration with @tailwindcss/vite
```

---

## ⚡ How to Run the Application

### 1. Start the Development Server

Navigate to the project directory and run:

```bash
cd brandguard-ai
npm run dev
```

Vite will start the local server (typically at `http://localhost:5173`). Open this URL in your web browser.

### 2. Standalone Demo Mode (Zero Setup Required)

BrandGuard AI includes an out-of-the-box local demo mode:
- No Supabase account or external API keys are required to explore all 9 views immediately.
- Use the quick 1-click persona buttons on the sign-in screen (**Brand Director**, **Content Writer**, or **Legal Officer**) to test different permission roles.
- Use the **"Load Compliant Sample"** or **"Load Violations Sample"** buttons on the **Submit Content** page to trigger live compliance audits instantly.

---

## 🔒 Supabase PostgreSQL & Backend Setup

When you are ready to connect a live Supabase PostgreSQL database:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In your [Supabase Dashboard](https://supabase.com):
   - Go to **SQL Editor** -> Click **New Query**.
   - Paste the contents of `server/schema.sql` and run it to create tables (`brands`, `brand_guidelines`, `brand_rules`, `content_submissions`, `compliance_reports`, `compliance_violations`, `revision_history`, `review_actions`) and configure Row Level Security (RLS).
   - Go to **Project Settings** -> **API**.
   - Copy your **Project URL** and **anon public key** into `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
3. Restart the dev server (`npm run dev`). The status pill in the top header will automatically reflect `Supabase Live`.

---

## 🛡️ Secure Server-Side LLM Integration

To prevent exposing costly LLM API keys (OpenAI, Gemini, Anthropic) in client browsers:
- The frontend delegates analysis to `POST /api/analyze-compliance`.
- The sample server implementation in `server/llmProxyExample.js` demonstrates how to authenticate Supabase JWT tokens, fetch brand guidelines securely, format system prompts, and invoke LLMs safely server-side.
