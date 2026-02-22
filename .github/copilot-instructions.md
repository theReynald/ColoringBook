# ColorSplash — AI Agent Instructions

## Architecture Overview

A simple photo-to-coloring-page app. No auth, no real-time subscriptions, no watermarking.

Core Flow: User uploads a photo → OpenAI converts it to a coloring page → User colors it in the browser or browses a gallery.

- Next.js 16 App Router with TypeScript
- Supabase for database and storage (no auth)
- OpenAI Images Edit API (`gpt-image-1`) for image-to-coloring-page conversion
- Tailwind CSS 4 with custom theme tokens
- Nunito font via `next/font/google`

## Key Components & Data Flow

### Image Processing Pipeline

1. Upload (`src/components/CreatePage.tsx`) → sends FormData to API route
2. `/api/convert` uploads original to Supabase Storage (`originals/`)
3. Sends image to OpenAI `gpt-image-1` with coloring book prompt
4. Uploads result to Supabase Storage (`coloring-pages/`)
5. Inserts row into `images` table with `status: 'completed'`
6. Returns `{ id, originalUrl, coloringPageUrl }` to the client

### Database Schema

```
images: {
  id: UUID (primary key, auto-generated),
  user_id: UUID (hardcoded to '00000000-0000-0000-0000-000000000000'),
  original_url: TEXT,
  coloring_page_url: TEXT | null,
  name: TEXT,
  status: 'pending' | 'completed',
  created_at: TIMESTAMPTZ
}
```

### Supabase Clients

- `src/lib/supabase.ts` — Client-side (anon key, limited permissions)
- `src/lib/supabase-server.ts` — Server-side (`getSupabaseAdmin()`, service role key, bypasses RLS)
- All API routes and server components use `getSupabaseAdmin()`

## Routes & Pages

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server page | Renders `CreatePage` (upload + convert flow) |
| `/gallery` | Server page | Renders `GalleryGrid` (browse all coloring pages) |
| `/color/[id]` | Server page (`force-dynamic`) | Fetches image data, renders `ColoringCanvas` |
| `/api/convert` | POST | Upload photo → OpenAI → Supabase (60s `maxDuration`) |
| `/api/gallery` | GET / DELETE | List completed images / delete by ID |

## Components

| Component | Client/Server | Purpose |
|-----------|--------------|---------|
| `CreatePage` | Client | File upload, preview, convert trigger |
| `ColoringCanvas` | Client | Two-canvas drawing system (background + stroke overlay) |
| `GalleryGrid` | Client | Fetches `/api/gallery`, renders image cards |
| `Navigation` | Client | Tab nav (Create / Gallery), reads pathname |
| `Toast` / `showToast()` | Client | Global toast via module-level function, no context needed |
| `Header` | Server | Gradient logo + tagline |
| `Card` | Server | Glassmorphism wrapper (backdrop-blur, semi-transparent) |
| `BubblesBackground` | Client | Animated floating circles |
| `DecorativeElements` | Client | Twinkling stars/hearts/circles |
| `RainbowDivider` | Server | Gradient horizontal rule |
| `Loader` | Client | Full-screen bouncing dots overlay |

## Critical Implementation Details

### Server vs Client Boundary

- If a component uses `useState`, `useEffect`, browser APIs, or hooks → `"use client"`
- Pages are server components by default; they delegate to client children
- Secrets (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) only exist in API routes and server components

### Two-Canvas Coloring Architecture

`ColoringCanvas` uses two layered HTML5 canvases:
- Background canvas: displays the coloring page image (read-only)
- Drawing canvas: transparent overlay capturing user strokes
- Undo = pop from `ImageData` snapshot array (max 20)
- Reset = clear the drawing canvas only
- Download = composite both canvases into one PNG via `drawImage()`

### Toast Pattern

`showToast()` is exported from `Toast.tsx` as a plain function (not a hook). Any file can import and call it directly. `ToastContainer` must be rendered once in each page tree.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      — Supabase project URL (client + server)
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (client + server)
SUPABASE_SERVICE_ROLE_KEY     — Supabase admin key (server only)
OPENAI_API_KEY                — OpenAI key (server only)
```

No `NEXT_PUBLIC_` prefix on `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` — they must never reach the browser.

## Development Workflow

```bash
npm install
npm run dev     # Starts Next.js dev server at http://localhost:3000
```

### Project-Specific Patterns

- Use `getSupabaseAdmin()` for all server-side Supabase operations
- All image uploads go to the `images` bucket in Supabase Storage under `originals/` or `coloring-pages/`
- File IDs are generated with `uuid.v4()`
- File validation: JPG/PNG/WEBP only, max 20MB, enforced both client-side and server-side
- Inline `style={{}}` is used heavily for gradients and glassmorphism effects
- Custom Tailwind theme tokens: `text-plum`, `text-plum-muted`, `bg-mint`, `text-pink-candy`, etc.

## Common Tasks

### Adding a New Page

1. Create `src/app/<route>/page.tsx` as a server component
2. Include `BubblesBackground`, `DecorativeElements`, `Header`, `Navigation` for consistent layout
3. Include `ToastContainer` if the page needs notifications
4. Wrap content in a `<Card>` for the glassmorphism look

### Adding a New API Route

1. Create `src/app/api/<name>/route.ts`
2. Use `getSupabaseAdmin()` for database/storage operations
3. Validate inputs and return proper error responses with status codes
4. Set `export const maxDuration = 60` if the route calls external APIs

### Debugging Issues

1. Check terminal for `console.error` output from API routes
2. Verify all four env vars are set in `.env.local`
3. Confirm the Supabase `images` bucket is public
4. Confirm the `images` database table exists
