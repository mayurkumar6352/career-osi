# CareerOS — Career Operating System

The most advanced job application tracker, interview CRM, networking CRM, and career management platform. Built with Next.js 15, TypeScript, Supabase, Prisma, and OpenAI.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Auth**: Supabase Auth (Email/Password + Google OAuth)
- **AI**: OpenAI GPT-4o-mini
- **State**: Zustand, React Query, React Hook Form
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Email**: Resend

## Features

- 📋 **Application Pipeline** — Kanban & Table views, drag-and-drop status management
- 🎯 **Interview CRM** — Schedule, prep, feedback tracking with AI question generation
- 👥 **Recruiter CRM** — Track all recruiter relationships and contact history
- 🤝 **Networking Hub** — Manage connections, alumni, mentors, referrals
- 🎁 **Offer Comparison** — Compare offers side-by-side with scoring
- 🤖 **AI Copilot** — Interview questions, follow-up emails, resume analysis, STAR answers
- 📊 **Analytics** — Response rates, funnel analysis, industry/source breakdowns
- ✅ **Task Management** — Priority-based tasks with categories
- 🔔 **Notifications** — Real-time alerts for interviews, tasks, offers
- ⌨️ **Command Palette** — `⌘K` to search and navigate
- 🌙 **Dark/Light Mode** — Full theme support

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd careerios
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your Supabase, OpenAI, and Resend credentials
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your Project URL and anon key to `.env.local`
3. Enable Google OAuth in Authentication → Providers
4. Set redirect URL: `http://localhost:3000/api/auth/callback`

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
careerios/
├── app/
│   ├── (auth)/           # Login, Register, Forgot Password
│   ├── (dashboard)/      # All authenticated pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── applications/ # Application pipeline
│   │   ├── interviews/   # Interview management
│   │   ├── recruiters/   # Recruiter CRM
│   │   ├── networking/   # Networking hub
│   │   ├── offers/       # Offer comparison
│   │   ├── analytics/    # Career analytics
│   │   ├── tasks/        # Task management
│   │   ├── settings/     # User settings
│   │   └── profile/      # User profile
│   ├── api/              # API route handlers
│   └── onboarding/       # Multi-step onboarding
├── components/
│   ├── ui/               # Base UI components (shadcn)
│   ├── layout/           # Sidebar, Header, Command Palette
│   ├── dashboard/        # Stats, Charts, Activity Feed
│   ├── applications/     # Kanban, Table, Forms
│   ├── interviews/       # Interview forms and views
│   ├── ai/               # AI Copilot
│   └── offers/           # Offer comparison
├── lib/
│   ├── actions/          # Server Actions
│   ├── repositories/     # Database access layer
│   ├── validators/        # Zod schemas
│   └── utils/            # Utility functions
├── types/                # TypeScript types
└── prisma/
    └── schema.prisma     # Database schema
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `DATABASE_URL` | PostgreSQL connection string (with pgbouncer) |
| `DIRECT_URL` | PostgreSQL direct connection string |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `RESEND_API_KEY` | Resend API key for emails |
| `NEXT_PUBLIC_APP_URL` | Your app URL |
