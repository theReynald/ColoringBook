---
name: generate-project-tutorial
description: Analyze the current workspace and generate a complete step-by-step tutorial explaining how to build this project from scratch.
agent: agent
---
# Instructions for the Agent

1. Inspect the entire workspace.
2. Detect:
   - Framework (Next.js, Vite, Express, .NET, etc.)
   - Frontend library (React, Vue, plain HTML, etc.)
   - Backend structure (API routes, controllers, services)
   - Database usage (Supabase, Firebase, local DB, etc.)
   - Authentication (if present)
   - Storage system (if present)
   - External APIs (OpenAI, Stripe, etc.)
   - Environment variable usage
3. Identify:
   - Project structure
   - Entry points
   - Core business logic
   - Data flow
   - UI flow
4. Reconstruct how this project would be built from zero.

Do not summarize the project.
Teach how to build it.

---

# Required Output Structure

## 1. Project Overview

- What the app does
- High-level architecture
- Tech stack
- Data flow diagram (in text form)

---

## 2. Prerequisites

- Required tools
- Node or runtime versions
- Accounts needed
- Environment variables required

---

## 3. Step 1: Project Initialization

Explain how to create the base project from scratch.

Include:
- CLI commands
- Package installation
- Initial configuration
- Folder setup

---

## 4. Step 2: Core Architecture

Explain:
- Folder structure
- Why each directory exists
- Separation of concerns
- Server vs client boundaries

Include a file tree example.

---

## 5. Step 3: Feature Implementation

Break this into logical sections such as:

- UI layout
- Components
- API routes
- Business logic
- Data layer
- Third-party integrations

For each:
- Show example code
- Explain what it does
- Explain why it's structured this way

---

## 6. Step 4: External Integrations

If the project uses:
- Supabase
- OpenAI
- Stripe
- Auth providers
- Storage systems

Explain:
- Why it is used
- How to configure it
- Where keys are stored
- Security considerations
- Common mistakes

---

## 7. Step 5: Running the App

- Dev mode
- Production build
- Environment setup
- Common runtime issues

---

## 8. Troubleshooting Section

Identify potential issues based on the codebase.

Examples:
- Missing env vars
- API route errors
- CORS
- Payload limits
- DB connection issues
- Storage provisioning

---

## 9. Architecture Deep Dive (Optional but Valuable)

Explain:
- Why this design works
- Where scalability bottlenecks could appear
- What could be refactored
- How to productionize it

---

## 10. Lightweight Version Guidance

Explain how to:

- Remove unnecessary services
- Simplify the architecture
- Convert to a single-page lightweight version
- Replace database or storage with local alternatives if possible

---

# Style Requirements

- Use clear headings
- Use numbered steps
- Provide copy-pasteable commands
- Keep explanations concise but informative
- Avoid long dashes in writing
- Do not assume prior knowledge of this specific repo
- Make it suitable for a tutorial video

---

# Important

The tutorial must reflect the actual current project, not a generic template.

If something is missing from the repo, clearly state assumptions.

Be accurate to the workspace.