# Tiger Tail

An academic collaboration and opportunity platform for RIT students and faculty and community. Tiger Tail combines a gig marketplace that allows everyone to request and offer any kind of help,  and a research hub to facilitate academic tasks, research participation, and scholarly collaboration within the RIT community.

## Features

- **Gig Marketplace**: Post and accept academic tasks and life gigs with TigerCredits compensation (or any mutually agreed compensation)
- **Research Hub**: Find research opportunities, recruit participants, seek peer reviews, and showcase publications
- **User Profiles**: Build reputation through completed gigs and research contributions
- **Real-time Updates**: Stay connected with instant notifications and messaging

## Running the code

Run `npm i` to install the dependencies.

## Gemini setup (Gig Appraiser)

1. Open `.env.local` in the project root.
2. Set `VITE_GEMINI_API_KEY` to your Gemini API key.
3. Keep `VITE_GEMINI_MODEL=gemini-2.5-flash-lite` for a low-cost/simple setup.

For frontend-only local development, this works immediately with Vite. For production best practice, keep the API key on a server (for example, a Supabase Edge Function) and call Gemini from there so the key is never exposed to browsers.

Run `npm run dev` to start the development server.
