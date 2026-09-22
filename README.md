# AI-Deck 🃏

AI-powered project management through conversation. Chat with AI to create projects, break down tasks, and visualize progress — all rendered as interactive components.

## Concept

A chat-first project management tool where:
- You **talk** to the AI about your projects
- AI **renders interactive components** (task lists, Kanban boards, charts) in the chat
- Everything is **persisted** in SQLite — your data stays local
- Powered by **Gemini API** with function calling → generative UI

## Tech Stack

- **Next.js 15** (App Router)
- **Vercel AI SDK** (`@ai-sdk/google`) — streaming + tool calls
- **SQLite** (`better-sqlite3`) — zero-config persistence
- **shadcn/ui + Tailwind CSS** — UI components
- **Recharts** — data visualization

## Getting Started

```bash
# Install dependencies
npm install

# Set your Gemini API key
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_GENERATIVE_AI_API_KEY

# Run dev server
npm run dev
```

## License

MIT
