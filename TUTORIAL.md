# ColorSplash: Build a Photo-to-Coloring-Page App from Scratch

A step-by-step tutorial for recreating this project from zero. By the end, you will have a fully working app that converts photos into coloring book pages, lets you color them in the browser, and stores everything in the cloud.

---

## Table of Contents

1. [Chapter 1: Project Overview](#chapter-1-project-overview)
   1.1 [What the App Does](#11-what-the-app-does)
   1.2 [High-Level Architecture](#12-high-level-architecture)
   1.3 [Tech Stack](#13-tech-stack)
   1.4 [Data Flow](#14-data-flow)
2. [Chapter 2: Prerequisites](#chapter-2-prerequisites)
   2.1 [Required Tools](#21-required-tools)
   2.2 [Accounts Needed](#22-accounts-needed)
   2.3 [Environment Variables](#23-environment-variables)
3. [Chapter 3: Project Initialization](#chapter-3-project-initialization)
   3.1 [Create the Next.js Project](#31-create-the-nextjs-project)
   3.2 [Install Additional Dependencies](#32-install-additional-dependencies)
   3.3 [Configure Next.js for Remote Images](#33-configure-nextjs-for-remote-images)
   3.4 [Create the Environment File](#34-create-the-environment-file)
4. [Chapter 4: Core Architecture](#chapter-4-core-architecture)
   4.1 [Folder Structure](#41-folder-structure)
   4.2 [Why Each Directory Exists](#42-why-each-directory-exists)
   4.3 [Server vs Client Boundaries](#43-server-vs-client-boundaries)
5. [Chapter 5: Feature Implementation](#chapter-5-feature-implementation)
   5.1 [Supabase Setup (Database + Storage)](#51-supabase-setup-database--storage)
   5.2 [Supabase Client Libraries](#52-supabase-client-libraries)
   5.3 [Global Layout and Styling](#53-global-layout-and-styling)
   5.4 [UI Components](#54-ui-components)
   5.5 [Create Page (Upload + Convert Flow)](#55-create-page-upload--convert-flow)
   5.6 [Convert API Route](#56-convert-api-route)
   5.7 [Gallery API Route](#57-gallery-api-route)
   5.8 [Gallery Page](#58-gallery-page)
   5.9 [Coloring Canvas Page](#59-coloring-canvas-page)
   5.10 [Interactive Coloring Canvas](#510-interactive-coloring-canvas)
   5.11 [Toast Notification System](#511-toast-notification-system)
6. [Chapter 6: External Integrations](#chapter-6-external-integrations)
   6.1 [Supabase](#61-supabase)
   6.2 [OpenAI (gpt-image-1)](#62-openai-gpt-image-1)
7. [Chapter 7: Running the App](#chapter-7-running-the-app)
   7.1 [Development Mode](#71-development-mode)
   7.2 [Production Build](#72-production-build)
   7.3 [Environment Setup Checklist](#73-environment-setup-checklist)
   7.4 [Verifying Everything Works](#74-verifying-everything-works)
8. [Chapter 8: Troubleshooting](#chapter-8-troubleshooting)
   8.1 [Missing Environment Variables](#81-missing-environment-variables)
   8.2 [OpenAI API Errors](#82-openai-api-errors)
   8.3 [Function Timeout](#83-function-timeout)
   8.4 [Supabase Storage 403 Errors](#84-supabase-storage-403-errors)
   8.5 [CORS Issues](#85-cors-issues)
   8.6 [File Too Large](#86-file-too-large)
   8.7 [Database Table Missing](#87-database-table-missing)
9. [Chapter 9: Architecture Deep Dive](#chapter-9-architecture-deep-dive)
   9.1 [Why This Design Works](#91-why-this-design-works)
   9.2 [Where Scalability Bottlenecks Could Appear](#92-where-scalability-bottlenecks-could-appear)
   9.3 [What Could Be Refactored](#93-what-could-be-refactored)
   9.4 [How to Productionize It](#94-how-to-productionize-it)
10. [Chapter 10: Lightweight Version Guidance](#chapter-10-lightweight-version-guidance)
    10.1 [Remove Supabase (Local-Only Version)](#101-remove-supabase-local-only-version)
    10.2 [Remove the Gallery](#102-remove-the-gallery)
    10.3 [Single-Page Version](#103-single-page-version)
    10.4 [Replace OpenAI with a Free Alternative](#104-replace-openai-with-a-free-alternative)

---

## Chapter 1: Project Overview

### 1.1 What the App Does

ColorSplash lets you upload a photo and converts it into a black-and-white coloring book page using the OpenAI image editing API (`gpt-image-1`). You can then color the generated page directly in the browser using an interactive canvas, download the results, and browse a gallery of all your previous creations.

### 1.2 High-Level Architecture

```text
[ Browser (React/Next.js) ]
        |
        | Upload FormData
        v
[ Next.js API Route: /api/convert ]
        |
        |--- Upload original to Supabase Storage
        |--- Send image to OpenAI gpt-image-1 API
        |--- Upload coloring page result to Supabase Storage
        |--- Insert metadata into Supabase Postgres (images table)
        |
        v
[ Browser receives: image ID + URLs ]
        |
        |--- Display result
        |--- Navigate to /color/[id] for canvas coloring
        |--- Navigate to /gallery for browsing all pages
```

### 1.3 Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Framework    | Next.js 16 (App Router)                |
| Language     | TypeScript                             |
| UI           | React 19, Tailwind CSS 4               |
| Database     | Supabase (PostgreSQL)                  |
| File Storage | Supabase Storage                       |
| AI/ML        | OpenAI Images Edit API (`gpt-image-1`) |
| Font         | Google Fonts (Nunito)                  |
| UUID         | `uuid` package (v4)                    |

### 1.4 Data Flow

```text
1. You upload a photo (JPG/PNG/WEBP, max 20MB)
2. POST /api/convert receives the FormData
3. Original image is stored in Supabase Storage bucket "images" under originals/
4. Image is sent to OpenAI gpt-image-1 with a coloring-book prompt
5. OpenAI returns a b64_json or URL of the generated coloring page
6. Coloring page PNG is stored in Supabase Storage under coloring-pages/
7. A database row is created in the "images" table with both URLs + metadata
8. Browser receives the record ID and coloring page URL
9. You can color on an HTML5 Canvas overlay, download the result, or browse the gallery
```

### Chapter 1 Recap

In this chapter, you learned:

1. What ColorSplash does at a high level
2. How the browser, API routes, Supabase, and OpenAI interact
3. The full tech stack powering the app
4. The end-to-end data flow from upload to coloring

You now have the big picture. Next, you will make sure you have everything you need before writing code.

---

## Chapter 2: Prerequisites

### 2.1 Required Tools

- **Node.js** v18.17 or later (v20+ recommended)
- **npm** (comes with Node.js) or **pnpm** / **yarn**
- A code editor (VS Code recommended)
- A web browser

### 2.2 Accounts Needed

1. **OpenAI account** with API access and billing enabled
   - You need an API key with access to the `gpt-image-1` model
   - Sign up at https://platform.openai.com

2. **Supabase account** (free tier works)
   - Sign up at https://supabase.com
   - You will create a project with a database and a storage bucket

### 2.3 Environment Variables

You will create a `.env.local` file in the project root with these four values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
```

| Variable                        | Where to Find It                    | Purpose                                        |
| ------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard > Settings > API | Public Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API | Public anonymous key (safe for client-side)    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard > Settings > API | Server-only admin key (never expose to client) |
| `OPENAI_API_KEY`                | OpenAI Dashboard > API Keys         | Used server-side to call the image edit API    |

> ⚠️ **Warning:** Never commit `.env.local` to version control. It contains secret keys that could compromise your project and your OpenAI billing account.

### Chapter 2 Recap

In this chapter, you confirmed:

1. The required tools and runtime versions
2. Which third-party accounts you need
3. The four environment variables and where to find each one

You are now ready to scaffold the project. Next, you will initialize the codebase from scratch.

---

## Chapter 3: Project Initialization

### 3.1 Create the Next.js Project

Run this command to scaffold a new Next.js app:

```bash
npx create-next-app@latest coloring-book --typescript --tailwind --eslint --app --src-dir
```

When prompted, choose these options:

1. TypeScript: **Yes**
2. ESLint: **Yes**
3. Tailwind CSS: **Yes**
4. `src/` directory: **Yes**
5. App Router: **Yes**
6. Turbopack: **Yes** (default)
7. Customize import alias: **Yes**, use `@/*`

### 3.2 Install Additional Dependencies

```bash
cd coloring-book
npm install @supabase/supabase-js uuid
npm install -D @types/uuid
```

| Package                 | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `@supabase/supabase-js` | Client library for Supabase (DB + Storage) |
| `uuid`                  | Generate unique file IDs for storage paths |
| `@types/uuid`           | TypeScript types for uuid                  |

### 3.3 Configure Next.js for Remote Images

Update your Next.js config to allow loading images from your Supabase storage domain.

**`next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

### 3.4 Create the Environment File

```bash
touch .env.local
```

Paste your credentials into this file (see the table in Section 2.3 for where to find each value).

### Chapter 3 Recap

In this chapter, you:

1. Scaffolded a Next.js 16 project with TypeScript, Tailwind CSS, and the App Router
2. Installed Supabase and UUID dependencies
3. Configured remote image patterns for Supabase
4. Created the `.env.local` file for your secrets

Your project skeleton is ready. Next, you will learn how the folder structure is organized and why.

---

## Chapter 4: Core Architecture

### 4.1 Folder Structure

```text
coloring-book/
├── public/                      # Static assets (favicon, images)
├── src/
│   ├── app/                     # Next.js App Router pages + API routes
│   │   ├── globals.css          # Tailwind imports, custom theme, animations
│   │   ├── layout.tsx           # Root HTML shell, font loading
│   │   ├── page.tsx             # Home page (Create tab)
│   │   ├── api/
│   │   │   ├── convert/
│   │   │   │   └── route.ts     # POST: upload photo, call OpenAI, store results
│   │   │   └── gallery/
│   │   │       └── route.ts     # GET: list pages, DELETE: remove a page
│   │   ├── color/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Dynamic page: interactive coloring canvas
│   │   └── gallery/
│   │       └── page.tsx         # Gallery listing page
│   ├── components/              # Reusable React components
│   │   ├── BubblesBackground.tsx  # Animated floating bubble background
│   │   ├── Card.tsx               # Glassmorphism card wrapper
│   │   ├── ColoringCanvas.tsx     # HTML5 Canvas coloring interface
│   │   ├── CreatePage.tsx         # Upload + convert form (client component)
│   │   ├── DecorativeElements.tsx # Floating stars/hearts/circles
│   │   ├── GalleryGrid.tsx        # Grid of created coloring pages
│   │   ├── Header.tsx             # App logo + tagline
│   │   ├── Loader.tsx             # Full-screen loading overlay
│   │   ├── Navigation.tsx         # Tab nav (Create / Gallery)
│   │   ├── RainbowDivider.tsx     # Gradient horizontal rule
│   │   └── Toast.tsx              # Global toast notification system
│   └── lib/                     # Shared utilities
│       ├── supabase.ts          # Client-side Supabase instance (anon key)
│       └── supabase-server.ts   # Server-side Supabase instance (service role key)
├── .env.local                   # Environment variables (not committed)
├── next.config.ts               # Next.js config
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts           # (auto via Tailwind v4 + PostCSS)
└── tsconfig.json
```

### 4.2 Why Each Directory Exists

- **`src/app/`** contains all routes. Next.js App Router uses the filesystem as route definitions. Each folder with a `page.tsx` becomes a URL.
- **`src/app/api/`** contains server-side API route handlers. These run only on the server and access secrets like `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
- **`src/components/`** holds reusable UI building blocks. Separating them from pages keeps your page files lean and enables reuse across routes.
- **`src/lib/`** contains shared non-UI code. Two Supabase clients are needed: one for client-side reads (anon key) and one for server-side writes (service role key with admin privileges).

### 4.3 Server vs Client Boundaries

| File                   | Runs On | Why                                                     |
| ---------------------- | ------- | ------------------------------------------------------- |
| `layout.tsx`           | Server  | Static HTML shell, no interactivity                     |
| `page.tsx` (home)      | Server  | Renders server components, delegates to client children |
| `color/[id]/page.tsx`  | Server  | Fetches image data from Supabase at request time        |
| `api/convert/route.ts` | Server  | Processes uploads, calls OpenAI, writes to DB           |
| `api/gallery/route.ts` | Server  | Reads/deletes from database                             |
| `CreatePage.tsx`       | Client  | `"use client"` because it manages file input state      |
| `ColoringCanvas.tsx`   | Client  | `"use client"` because it uses HTML5 Canvas APIs        |
| `GalleryGrid.tsx`      | Client  | `"use client"` because it fetches data on mount         |
| `Navigation.tsx`       | Client  | `"use client"` because it reads current pathname        |

> 💡 **Tip:** A good rule of thumb in Next.js App Router: if a component needs browser APIs, user interaction state, or hooks like `useState`, mark it `"use client"`. Everything else stays as a server component by default.

### Chapter 4 Recap

In this chapter, you:

1. Reviewed the complete folder structure and what each file does
2. Understood why the directories are separated the way they are
3. Learned which files run on the server vs. the client and why

You now understand the architecture. Next, you will build every feature piece by piece.

---

## Chapter 5: Feature Implementation

> 🚨 **Important:** You must complete Chapters 2 and 3 before starting this chapter. The Supabase project and environment variables are prerequisites for most of what follows.

### 5.1 Supabase Setup (Database + Storage)

Before writing any code, you need to set up your Supabase project.

#### Create a Supabase Project

1. Go to https://supabase.com and create a new project.
2. Note your **Project URL**, **anon key**, and **service role key** from Settings > API.

#### Create the Database Table

Open the Supabase SQL Editor and run this query:

```sql
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  original_url TEXT NOT NULL,
  coloring_page_url TEXT,
  name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

This table stores one row per coloring page conversion, linking the original photo URL and the generated coloring page URL.

#### Create the Storage Bucket

1. In Supabase Dashboard, go to **Storage**.
2. Create a new bucket named `images`.
3. Set it to **Public** (so images can be loaded by the browser).
4. Optionally add a policy to allow public reads:

```sql
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
```

> ⚠️ **Warning:** If you forget to make the bucket public, all image URLs will return 403 errors and nothing will display in the browser.

### 5.2 Supabase Client Libraries

You need two separate Supabase clients to enforce security boundaries.

#### Client-Side Client

**`src/lib/supabase.ts`**

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _supabase;
}
```

This uses the **anon key**, which has limited permissions. It could be used in client components for read-only access to public data. In this project, client-side fetches go through the API routes instead.

#### Server-Side Client

**`src/lib/supabase-server.ts`**

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabaseAdmin;
}
```

This uses the **service role key**, which bypasses Row Level Security and can perform any operation. You should only import it in server-side files (API routes and server components).

### 5.3 Global Layout and Styling

#### Root Layout

**`src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito-var",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ColorSplash — Turn Photos into Coloring Pages",
  description:
    "Upload any photo and transform it into a beautiful coloring book page.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

Key decisions:

- **Nunito font** is loaded via `next/font/google` for optimal performance (self-hosted, no external requests at runtime).
- The font is assigned to a CSS variable `--font-nunito-var` and referenced in `globals.css`.

#### Global CSS

**`src/app/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --color-pink-candy: #ff6b9d;
  --color-lavender: #c084fc;
  --color-mint: #6ee7b7;
  --color-peach: #fbbf24;
  --color-baby-blue: #7dd3fc;
  --color-pink-light: #fff0f5;
  --color-lavender-light: #f5f0ff;
  --color-plum: #4a3060;
  --color-plum-light: #7c6a96;
  --color-plum-muted: #9b8ab8;
  --color-plum-hint: #b8a5cc;
  --color-glass-bg: rgba(255, 255, 255, 0.55);
  --color-glass-border: rgba(255, 255, 255, 0.7);
  --font-nunito: var(--font-nunito-var);
  /* Animation keyframes also defined here */
}
```

This uses Tailwind CSS v4's `@theme inline` directive to define custom design tokens directly accessible in utility classes (e.g., `text-plum`, `bg-mint`). Custom keyframe animations handle the floating bubbles, twinkling decorations, and loader dots.

### 5.4 UI Components

#### Card Component

**`src/components/Card.tsx`**

```tsx
import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[32px] p-8 mb-6 transition-shadow duration-300 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        border: "1.5px solid rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow:
          "0 8px 32px rgba(192,132,252,0.10), 0 1.5px 6px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}
```

The glassmorphism effect is achieved with `backdrop-filter: blur()` and a semi-transparent white background. You will use this `Card` wrapper throughout the entire app.

#### Header

**`src/components/Header.tsx`**

```tsx
export default function Header() {
  return (
    <header className="text-center mb-8 relative z-10">
      <h1
        className="text-5xl font-black tracking-tight mb-2"
        style={{
          background: "linear-gradient(135deg, #FF6B9D, #C084FC, #7DD3FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "logoShimmer 6s ease-in-out infinite alternate",
        }}
      >
        ColorSplash 🎨
      </h1>
      <p className="text-plum-muted text-lg font-semibold">
        Turn your photos into magical coloring pages!
      </p>
    </header>
  );
}
```

The gradient text effect uses `background-clip: text` with a transparent text fill color.

#### Navigation

**`src/components/Navigation.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "✨ Create", key: "create" },
  { href: "/gallery", label: "🖼️ Gallery", key: "gallery" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="flex justify-center gap-3 mb-8 relative z-10">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.key === "create"
            ? pathname === "/"
            : pathname.startsWith(`/${item.key}`);
        return (
          <Link
            key={item.key}
            href={item.href}
            className="px-6 py-3 rounded-full font-extrabold text-sm transition-all"
            style={{
              background: isActive
                ? "linear-gradient(135deg, #FF6B9D, #C084FC)"
                : "rgba(255, 255, 255, 0.55)",
              color: isActive ? "#fff" : "#7C6A96",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

#### Decorative Components

These components create the playful visual identity of the app:

- **`BubblesBackground`**: Creates 18 randomly sized, colored circles that float upward using CSS animations. Uses `useEffect` to generate DOM elements on mount.
- **`DecorativeElements`**: Renders fixed-position stars, hearts, and circles at various screen positions with twinkling animations. Uses CSS `clip-path` for star and heart shapes.
- **`RainbowDivider`**: A simple gradient horizontal line used to separate content sections.
- **`Loader`**: A full-screen overlay with bouncing colored dots, shown during the conversion process.
- **`Toast`**: A global notification system using a module-level variable (`addToastGlobal`) so any file can call `showToast("message")` without prop drilling.

### 5.5 Create Page (Upload + Convert Flow)

The `CreatePage` component is the core user interaction. This is where users upload a photo and trigger the conversion.

**`src/components/CreatePage.tsx`**

```tsx
"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    coloringPageUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error);
        return;
      }
      setResult({ id: data.id, coloringPageUrl: data.coloringPageUrl });
    } finally {
      setLoading(false);
    }
  };
  // ... renders upload dropzone, preview, convert button, result card
}
```

Here is the user flow:

1. Drag-and-drop or click to select an image file
2. Client-side validation checks file type (JPG/PNG/WEBP) and size (max 20MB)
3. A preview is shown using `URL.createObjectURL()`
4. Click "Convert to Coloring Page" to send the FormData to `/api/convert`
5. While processing, a full-screen `Loader` overlay is displayed
6. On success, the result card appears with Download, Color It, and New Image buttons

### 5.6 Convert API Route

This is the server-side brain of your app.

**`src/app/api/convert/route.ts`**

```ts
export async function POST(req: NextRequest) {
  // 1. Parse FormData and extract the uploaded file
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  // 2. Validate file type and size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    /* return 400 */
  }
  if (file.size > 20 * 1024 * 1024) {
    /* return 400 */
  }

  // 3. Read file into a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Upload original to Supabase Storage
  const fileId = uuidv4();
  await supabaseAdmin.storage
    .from("images")
    .upload(`originals/${fileId}.${ext}`, buffer, { contentType: file.type });

  // 5. Get the public URL of the original
  const originalUrl = supabaseAdmin.storage
    .from("images")
    .getPublicUrl(`originals/${fileId}.${ext}`);

  // 6. Call OpenAI gpt-image-1 API
  const openaiFormData = new FormData();
  openaiFormData.append("model", "gpt-image-1");
  openaiFormData.append(
    "prompt",
    "Convert this photo into a black and white coloring book page...",
  );
  openaiFormData.append("image[]", imageBlob, `image.${ext}`);
  openaiFormData.append("size", "1024x1024");

  const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: openaiFormData,
  });

  // 7. Extract result (base64 or URL)
  const resultB64 = openaiData.data?.[0]?.b64_json;
  const coloringPageBuffer = Buffer.from(resultB64, "base64");

  // 8. Upload coloring page to Supabase Storage
  await supabaseAdmin.storage
    .from("images")
    .upload(`coloring-pages/${fileId}.png`, coloringPageBuffer);

  // 9. Insert database record
  const { data: dbRecord } = await supabaseAdmin
    .from("images")
    .insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      original_url: originalUrlData.publicUrl,
      coloring_page_url: coloringUrlData.publicUrl,
      name: file.name,
      status: "completed",
    })
    .select("id")
    .single();

  // 10. Return ID and URLs to the client
  return NextResponse.json({
    id: dbRecord.id,
    originalUrl: originalUrlData.publicUrl,
    coloringPageUrl: coloringUrlData.publicUrl,
  });
}
```

> 📝 **Note:** The `export const maxDuration = 60;` at the top of this file increases the serverless function timeout to 60 seconds. OpenAI image generation can take a while, so this prevents premature timeouts on platforms like Vercel.

### 5.7 Gallery API Route

This route provides two handlers for listing and deleting coloring pages.

**`src/app/api/gallery/route.ts`**

```ts
// GET: Fetch all completed coloring pages, newest first
export async function GET() {
  const { data } = await supabase
    .from("images")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false });
  return NextResponse.json(data);
}

// DELETE: Remove a specific coloring page by ID
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await supabase.from("images").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
```

### 5.8 Gallery Page

This is a simple server component page that renders shared layout elements and the `GalleryGrid` client component.

**`src/app/gallery/page.tsx`**

```tsx
export default function GalleryPage() {
  return (
    <>
      <BubblesBackground />
      <DecorativeElements />
      <main className="relative z-10 max-w-[780px] mx-auto px-5 pt-8 pb-16">
        <Header />
        <Navigation />
        <h2>Your Coloring Pages</h2>
        <GalleryGrid />
      </main>
    </>
  );
}
```

The `GalleryGrid` component fetches `/api/gallery` on mount and renders a responsive 2-column grid. Each card shows the original vs. coloring page side by side, with Color, Save, and Delete buttons.

### 5.9 Coloring Canvas Page

This is a dynamic server component that fetches coloring page data at request time.

**`src/app/color/[id]/page.tsx`**

```tsx
export const dynamic = "force-dynamic";

export default async function ColorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return /* 404-style "not found" UI */;
  }

  return <ColoringCanvas imageUrl={data.coloring_page_url} pageId={id} />;
}
```

The `force-dynamic` export ensures the page is server-rendered on every request (not statically cached), so it always fetches fresh data.

### 5.10 Interactive Coloring Canvas

This is the most complex component. It implements a full browser-based coloring tool using two layered HTML5 canvases.

**`src/components/ColoringCanvas.tsx`**

The two-canvas architecture:

```text
[ Background Canvas (bgCanvasRef) ]  -- Displays the coloring page image
[ Drawing Canvas (canvasRef) ]       -- Transparent overlay, captures strokes
```

**Features:**

- 16 preset colors + a custom color picker
- 4 brush sizes (S/M/L/XL)
- Eraser mode (draws white)
- Undo (stores up to 20 `ImageData` snapshots)
- Reset (clears all strokes)
- Download (composites both canvases into a single PNG)

**How drawing works:**

1. The coloring page image is loaded onto the background canvas
2. `onPointerDown` starts a new stroke, `onPointerMove` draws lines using `canvas.getContext("2d")` methods
3. `onPointerUp` saves the current canvas state to the undo history
4. `touch-action: none` on the canvas prevents mobile scroll interference
5. Pointer events (not mouse events) are used for unified mouse + touch support

**Download compositing:**

```ts
const exportCanvas = document.createElement("canvas");
const ctx = exportCanvas.getContext("2d")!;
ctx.drawImage(bgCanvas, 0, 0); // Draw the coloring page
ctx.drawImage(drawCanvas, 0, 0); // Draw the user's strokes on top
link.href = exportCanvas.toDataURL("image/png");
```

> 💡 **Tip:** The two-canvas architecture is what makes undo and reset so simple. Since your strokes are on a separate transparent canvas, resetting means clearing one canvas without touching the background image at all.

### 5.11 Toast Notification System

This component uses a clever pattern to enable global toast access without React context.

**`src/components/Toast.tsx`**

```tsx
let addToastGlobal:
  | ((message: string, type?: "error" | "success") => void)
  | null = null;

export function showToast(
  message: string,
  type: "error" | "success" = "error",
) {
  addToastGlobal?.(message, type);
}

export default function ToastContainer() {
  const addToast = useCallback((message: string, type) => {
    // Add toast to state, auto-remove after 4 seconds
  }, []);

  useEffect(() => {
    addToastGlobal = addToast; // Register the function globally
  }, [addToast]);
}
```

Any component can `import { showToast } from "@/components/Toast"` and call it directly. You just need to render the `ToastContainer` once in your page tree.

### Chapter 5 Recap

In this chapter, you:

1. Set up Supabase with a database table and storage bucket
2. Created two Supabase client wrappers (anon for client, service role for server)
3. Built the root layout with Nunito font and a custom Tailwind CSS theme
4. Created reusable UI components (Card, Header, Navigation, decorative elements)
5. Built the upload and convert flow in `CreatePage`
6. Implemented the `/api/convert` route with OpenAI integration
7. Created the gallery API, gallery page, and gallery grid
8. Built the dynamic coloring canvas page with a two-canvas drawing system
9. Added a global toast notification system

You now have every feature implemented. Next, you will take a closer look at the external service integrations.

---

## Chapter 6: External Integrations

### 6.1 Supabase

**Why it is used:** Supabase provides both a PostgreSQL database (for storing image metadata) and an S3-compatible object storage bucket (for storing the actual image files). This eliminates the need to manage separate database and file hosting services.

**How to configure it:**

1. Create a Supabase project at supabase.com
2. In the SQL Editor, create the `images` table (see Section 5.1)
3. In Storage, create a public bucket named `images`
4. Copy the Project URL, anon key, and service role key into `.env.local`

**Where keys are stored:**

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are prefixed with `NEXT_PUBLIC_`, making them available on both client and server. This is safe because the anon key has limited permissions.
- `SUPABASE_SERVICE_ROLE_KEY` has **no** `NEXT_PUBLIC_` prefix, so it is only available on the server. This key bypasses Row Level Security and should never be exposed to the browser.

**Security considerations:**

- The service role key can perform any database operation. Only use it in API routes and server components.
- Consider adding Row Level Security (RLS) policies to the `images` table if you plan to add user authentication.
- The storage bucket is public, meaning anyone with the URL can view stored images. This is intentional for this app.

**Common mistakes:**

- Forgetting to make the storage bucket public (images will return 403 errors)
- Swapping the anon key and service role key
- Missing the `NEXT_PUBLIC_` prefix for the URL and anon key (they will be `undefined` at build time)

### 6.2 OpenAI (gpt-image-1)

**Why it is used:** The `gpt-image-1` model accepts an existing image and a text prompt, then returns an edited version. You use it here to transform photos into black-and-white coloring book outlines.

**How to configure it:**

1. Sign up at platform.openai.com
2. Create an API key
3. Ensure your account has billing enabled and access to the `gpt-image-1` model
4. Add the key to `.env.local` as `OPENAI_API_KEY`

**API call details:**

- Endpoint: `POST https://api.openai.com/v1/images/edits`
- The image is sent as a `FormData` blob under the field `image[]`
- The prompt instructs the model to create clean coloring book outlines
- Output size is fixed at `1024x1024`
- The response includes either `b64_json` (base64-encoded PNG) or a `url`

**Where the key is stored:** `OPENAI_API_KEY` in `.env.local` (server-only, no `NEXT_PUBLIC_` prefix).

> ⚠️ **Warning:** Your OpenAI API key is tied to your billing account. If it leaks, someone else can run up charges. Keep it server-only and out of version control.

**Common mistakes:**

- Using an API key without billing enabled (will return 429 errors)
- Not setting `maxDuration` (the default serverless timeout may be too short)
- Forgetting to handle both `b64_json` and `url` response formats

### Chapter 6 Recap

In this chapter, you:

1. Reviewed how Supabase is configured for database and storage
2. Understood the security model for Supabase keys
3. Learned how the OpenAI gpt-image-1 API is called and configured
4. Identified common integration mistakes and how to avoid them

Your integrations are solid. Next, you will learn how to run the app.

---

## Chapter 7: Running the App

### 7.1 Development Mode

```bash
npm run dev
```

This starts the Next.js development server (with Turbopack) at `http://localhost:3000`.

### 7.2 Production Build

```bash
npm run build
npm start
```

`npm run build` compiles the app for production. `npm start` runs the compiled app.

### 7.3 Environment Setup Checklist

Before running, verify:

1. `.env.local` exists with all four environment variables
2. Supabase project is created with:
   - An `images` table (see SQL in Section 5.1)
   - A public `images` storage bucket
3. OpenAI API key is active with billing enabled
4. Node.js v18.17+ is installed

### 7.4 Verifying Everything Works

1. Open `http://localhost:3000`
2. Upload a photo (JPG, PNG, or WEBP under 20MB)
3. Click "Convert to Coloring Page"
4. Wait for the conversion (can take 10-30 seconds)
5. The coloring page should appear
6. Click "Color It!" to test the canvas
7. Navigate to Gallery to see your saved pages

> 💡 **Tip:** If the conversion seems stuck, check your terminal for server-side error logs. The most common issue is an invalid or missing `OPENAI_API_KEY`.

### Chapter 7 Recap

In this chapter, you:

1. Ran the app in development mode
2. Learned how to create a production build
3. Walked through the environment setup checklist
4. Verified the full user flow end-to-end

Your app is running. Next, you will learn how to diagnose common problems.

---

## Chapter 8: Troubleshooting

### 8.1 Missing Environment Variables

**Symptom:** "OpenAI API key not configured on the server" or Supabase connection errors.
**Fix:** Ensure `.env.local` has all four variables. Restart the dev server after changes.

### 8.2 OpenAI API Errors

**Symptom:** 502 error from `/api/convert` with an OpenAI error message.
**Common causes:**

- Invalid or expired API key
- Billing not enabled on OpenAI account
- Rate limit exceeded
- Model `gpt-image-1` not available to your account

**Fix:** Check the server console for the specific OpenAI error message.

### 8.3 Function Timeout

**Symptom:** The conversion request times out or returns a 504.
**Cause:** The OpenAI image generation can take up to 60 seconds.
**Fix:** The `maxDuration = 60` export in the convert route handles this for Vercel deployments. For other hosting, ensure your server allows 60+ second request durations.

### 8.4 Supabase Storage 403 Errors

**Symptom:** Images fail to load in the browser.
**Cause:** The storage bucket is not public, or RLS policies block reads.
**Fix:** Make the `images` bucket public in Supabase Dashboard > Storage.

### 8.5 CORS Issues

**Symptom:** Canvas `crossOrigin` errors when drawing or downloading colored pages.
**Cause:** The coloring page image is loaded from a Supabase URL. Canvas requires CORS headers to export image data.
**Fix:** Supabase Storage serves CORS headers by default. Ensure you set `img.crossOrigin = "anonymous"` before setting the `src` (already done in `ColoringCanvas.tsx`).

### 8.6 File Too Large

**Symptom:** "File too large. Maximum 20MB." error.
**Fix:** Resize your image before uploading. The 20MB limit is enforced both client-side and server-side.

### 8.7 Database Table Missing

**Symptom:** "Failed to save record" errors.
**Fix:** Run the SQL from Section 5.1 in the Supabase SQL Editor to create the `images` table.

### Chapter 8 Recap

In this chapter, you learned how to diagnose and fix:

1. Missing environment variables
2. OpenAI API errors and billing issues
3. Serverless function timeouts
4. Supabase storage permission problems
5. CORS issues with the coloring canvas
6. File size limitations
7. Missing database table errors

You can now troubleshoot confidently. Next, you will dive deeper into the architecture decisions.

---

## Chapter 9: Architecture Deep Dive

### 9.1 Why This Design Works

1. **Server-side API routes protect secrets.** Your OpenAI key and Supabase service role key never leave the server.
2. **Supabase as a unified backend.** Using one service for both database and file storage simplifies deployment and reduces moving parts.
3. **Two-canvas compositing.** By separating the background image from your drawings, undo/reset is trivial (just clear the drawing canvas) and download is a simple composite.
4. **Module-level toast function.** The `showToast()` pattern avoids React context boilerplate while still being reactive.

### 9.2 Where Scalability Bottlenecks Could Appear

- **OpenAI API costs:** Each conversion calls the `gpt-image-1` model. At scale, this becomes expensive. Consider caching results or adding rate limiting per user.
- **No user authentication:** Currently, all images are stored under a hardcoded `user_id`. Adding auth (Supabase Auth) would be needed for multi-user support.
- **No pagination:** The gallery fetches all images at once. For hundreds of pages, add cursor-based pagination.
- **Storage costs:** Every conversion stores two images (original + coloring page). Consider adding cleanup for old/unused images.
- **Undo history in memory:** The coloring canvas stores up to 20 full `ImageData` snapshots in state. For very large canvases, this could consume significant memory.

### 9.3 What Could Be Refactored

- **Extract the OpenAI call** into a separate `lib/openai.ts` module for testability.
- **Add proper error types** instead of returning string messages.
- **Move inline styles** into Tailwind utilities or CSS modules. Many components use `style={{}}` for gradients and glassmorphism that could be custom Tailwind utilities.
- **Add a loading skeleton** to the gallery grid instead of the current spinner.
- **Consider server actions** for the convert flow instead of a manual `fetch()` to an API route.

### 9.4 How to Productionize It

1. **Add authentication** using Supabase Auth to associate images with real users.
2. **Add rate limiting** on the `/api/convert` route (e.g., 10 conversions per hour per IP).
3. **Add RLS policies** to the `images` table so users can only see their own pages.
4. **Deploy to Vercel** for automatic serverless function support with the `maxDuration` setting.
5. **Add monitoring** (Vercel Analytics, Sentry) for error tracking.
6. **Add image optimization** using Next.js `<Image>` component for gallery thumbnails.

### Chapter 9 Recap

In this chapter, you:

1. Understood why the current architecture works well for this use case
2. Identified five areas where scalability bottlenecks could emerge
3. Reviewed potential refactoring improvements
4. Got a roadmap for productionizing the app

You have a thorough understanding of the architecture. Finally, you will learn how to simplify the app if you need a lighter version.

---

## Chapter 10: Lightweight Version Guidance

### 10.1 Remove Supabase (Local-Only Version)

If you want to run the app without Supabase:

1. **Replace storage with local filesystem.** In the convert API route, write files to `public/uploads/` instead of Supabase Storage.
2. **Replace the database with a JSON file.** Store image metadata in a `data/images.json` file, read/write with `fs`.
3. **Remove the dependency:**
   ```bash
   npm uninstall @supabase/supabase-js
   ```
4. **Delete** `src/lib/supabase.ts` and `src/lib/supabase-server.ts`.
5. **Remove** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`.

### 10.2 Remove the Gallery

Delete `src/app/gallery/`, `src/components/GalleryGrid.tsx`, `src/app/api/gallery/route.ts`, and the Gallery link from `Navigation.tsx`.

### 10.3 Single-Page Version

To make the simplest possible version:

1. Keep only the home page (`/`) with `CreatePage`
2. Remove `/gallery` and `/color/[id]` routes
3. Remove the Navigation component
4. After conversion, show the result image with a download button (no coloring canvas)
5. This reduces the app to: upload > convert > download

### 10.4 Replace OpenAI with a Free Alternative

If you want to avoid OpenAI costs:

1. Use a client-side image filter library (e.g., apply edge detection with Canvas APIs) to create a coloring-book effect locally.
2. Replace the OpenAI call in `/api/convert` with another image processing API.
3. The quality will be lower, but there are no API costs.

> 📝 **Note:** The local edge-detection approach produces much simpler outlines compared to OpenAI's AI-generated result. For a demo or prototype, it works fine. For production quality, the AI approach is significantly better.

### Chapter 10 Recap

In this chapter, you learned how to:

1. Replace Supabase with local filesystem and JSON storage
2. Strip out the gallery feature
3. Reduce the app to a single upload-convert-download page
4. Swap OpenAI for a free client-side alternative

You now have all the knowledge you need to build, run, customize, and simplify ColorSplash from scratch.
