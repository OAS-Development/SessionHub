# 🚀 Bara - AI-Powered Personal Intelligence Platform

Your personal AI-powered productivity and intelligence platform built with Next.js 14, Supabase, and Claude AI.

## ✨ Features

- 🤖 **AI Chat Assistant** - Real-time conversations with Claude AI
- 🔐 **Secure Authentication** - Supabase Auth with email/password
- 📊 **Smart Dashboard** - Personalized insights and quick actions
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile-First** - Works seamlessly on all devices
- 🔧 **TypeScript** - Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **AI**: Claude API (Anthropic)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL (ready for future features)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd bara
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Claude AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Enable Email authentication in Authentication > Settings
4. Create the profiles table (optional - will be created automatically on first signup)

### 4. Set Up Claude AI

1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Add it to your `.env.local` file

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your AI platform!

## 📁 Project Structure

```
bara/
├── src/
│   ├── app/
│   │   ├── api/ai/chat/          # AI chat API endpoint
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # Protected dashboard
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ai-chat/              # AI chat components
│   │   ├── layout/               # Layout components
│   │   └── ui/                   # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   └── lib/
│       ├── claude.ts             # Claude AI client
│       ├── supabase.ts           # Supabase configuration
│       └── utils.ts              # Utility functions
└── README.md
```

## 🎯 Current Features

### ✅ Session 1 Complete
- Landing page with feature showcase
- User authentication (signup/login)
- Protected dashboard with overview
- AI chat sidebar with Claude integration
- Responsive navigation and layout
- Modern UI with gradient themes

### 🔮 Coming Soon
- Task management with AI analysis
- Goal tracking and progress monitoring
- Personal document library
- Zapier automation integrations
- Advanced analytics dashboard
- File upload and processing

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ⚠️ |
| `ANTHROPIC_API_KEY` | Your Claude AI API key | ✅ |

## 🤝 Contributing

This is a personal productivity platform. Feel free to fork and customize for your own needs!

## 📄 License

MIT License - feel free to use this project as a foundation for your own AI-powered applications.

---

**Built with ❤️ for power users who want AI-augmented productivity**
