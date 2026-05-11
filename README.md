# Nikhil Shukla AI Portfolio

Premium AI portfolio for Nikhil Shukla with a Next.js 15 frontend, Tailwind UI, Framer Motion, React Three Fiber, voice mode, and a built-in AI assistant API route.

## Highlights

- AI assistant in the hero with streaming responses.
- Local portfolio knowledge base, so no Cloudinary, Pinecone, MongoDB Atlas, or Redis is required.
- Optional OpenAI API support through `OPENAI_API_KEY`.
- Agentic UI actions: scroll sections, highlight projects, filter skills, show resume, open contact, and surface links.
- Voice input/output using the browser Web Speech APIs.
- CampusNest flagship project section with problem, solution, impact, architecture, live demo, and AI summary.

## Run Locally

```bash
npm install
npm run dev
```

App: http://localhost:3000

## OpenAI Setup

Create `.env.local` or `.env` from `.env.example` and add:

```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_API_URL=
```

Without the key, the assistant still works using local fallback responses.

## Where To Add More Content

- Portfolio text, projects, skills, repos: `src/data/portfolio.ts`
- Assistant knowledge base and actions: `server/portfolio-data.mjs`
- Resume PDF: `public/nikhil-shukla-resume.pdf`
- Profile photo: `public/nikhil-shukla.jpg`
- Contact email: `.env.example`, `src/data/portfolio.ts`, and `server/portfolio-data.mjs`

## Deploy

- Vercel can deploy the full app directly.
- Leave `NEXT_PUBLIC_API_URL` blank unless using a separate backend.
- Set `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel only if real OpenAI streaming answers are needed.
