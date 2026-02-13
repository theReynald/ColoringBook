---
applyTo: "**/[Tt]utorial*,**/[Gg]uide*,**/[Ww]alkthrough*,**/[Ll]esson*"
---

# Tutorial Writing Style Guide

These rules apply to any file with "tutorial", "guide", "walkthrough", or "lesson" in its name.

---

## Structure: Treat Every Tutorial Like a Book

### Table of Contents

Every tutorial must begin with a **Table of Contents** immediately after the title. Use nested numbered lists that link to all chapters, sections, and subsections.

```markdown
# Title of the Tutorial

## Table of Contents

1. [Chapter 1: Getting Started](#chapter-1-getting-started)
   1.1 [Setting Up Your Environment](#11-setting-up-your-environment)
   1.2 [Installing Dependencies](#12-installing-dependencies)
2. [Chapter 2: Building the Foundation](#chapter-2-building-the-foundation)
   2.1 [Creating the Project](#21-creating-the-project)
```

### Chapters

- Use `## Chapter N: Title` for top-level chapters.
- Number chapters sequentially starting from 1.
- Every chapter must cover one major topic or milestone.

### Sections

- Use `### N.M Section Title` for sections within a chapter (e.g., `### 2.1 Creating the Layout`).
- Number sections as `ChapterNumber.SectionNumber`.

### Steps

- Use numbered lists (`1.`, `2.`, `3.`) for sequential steps within a section.
- Use bullet points only for non-sequential items (lists of options, features, notes).
- Each step should describe one discrete action the reader takes.

### Chapter Recaps

End every chapter with a **Recap** subsection summarizing what was accomplished:

```markdown
### Chapter 2 Recap

In this chapter, you:

1. Created the project folder structure
2. Configured the database connection
3. Built your first API route

You now have a working backend. Next, you will build the frontend UI.
```

---

## Tone

- Write in **second person** ("you", "your").
- Use a **conversational but focused** tone. Talk to the reader like a mentor, not a textbook.
- Prefer active voice ("You will create..." not "A file will be created...").
- Keep sentences concise. One idea per sentence when explaining steps.
- Avoid filler like "Now let's go ahead and..." or "As you may know...". Get to the point.

Examples:

- **Good:** "Create a new file at `src/lib/db.ts`. This will hold your database connection logic."
- **Bad:** "Now, what we're going to want to do next is go ahead and create a new file."

---

## Code Blocks

### Language Tags Required

Every fenced code block must include a language tag. No bare triple-backtick blocks.

````markdown
Good:

```ts
const x = 1;
`` `

Bad:
`` `
const x = 1;
`` `
```
````

### File Paths Required

When a code block represents file contents, include the file path as a comment on the first line or in a bold label immediately above the block:

````markdown
**`src/app/layout.tsx`**

```tsx
import "./globals.css";

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
`` `
```
````

### Shell Commands

Use `bash` as the language tag for terminal commands. Prefix commands with `$` only when mixing commands with output. For command-only blocks, omit the `$`:

```bash
npm install @supabase/supabase-js
```

---

## Emoji Callout Blocks

Use blockquote callout blocks with emoji prefixes for warnings, tips, and notes. Use these consistently:

### Warning

```markdown
> ⚠️ **Warning:** Never commit your `.env.local` file to version control. It contains secret keys that could compromise your project.
```

### Tip

```markdown
> 💡 **Tip:** You can use `Cmd+Shift+P` in VS Code to quickly access the command palette.
```

### Note

```markdown
> 📝 **Note:** This step is optional if you are using the default configuration.
```

### Important

```markdown
> 🚨 **Important:** You must complete Chapter 2 before starting this chapter. The database setup is a prerequisite.
```

Use callout blocks when:

- Something could break or cause data loss (Warning)
- There is a shortcut or best practice (Tip)
- Context is helpful but not required to proceed (Note)
- A prerequisite or critical detail must not be skipped (Important)

Do not overuse callouts. Limit to 2-3 per chapter maximum.

---

## Updating Existing Tutorials

When editing an existing tutorial:

1. **Do not rewrite unchanged content.** Only modify the specific chapters, sections, or steps that need updating.
2. **Preserve the existing numbering scheme.** Do not renumber chapters or sections unless the structural change requires it.
3. **Mark new content.** When adding a new section to an existing chapter, place it in the correct sequential position and update the Table of Contents accordingly.
4. **Update the Table of Contents** to reflect any added, removed, or renamed sections.
5. **Update affected Chapter Recaps** if the changes alter what was accomplished in that chapter.
6. **Do not touch code blocks that have not changed.** If a code sample is still accurate, leave it as-is.
7. **When replacing a code block**, show the complete updated version. Do not use partial snippets with "..." or "// rest unchanged" for the replacement.
8. **Add a callout** if a section was significantly restructured:

```markdown
> 📝 **Note:** This section was updated to reflect the new authentication flow introduced in v2.0.
```

---

## Checklist

Before finalizing any tutorial, verify:

- [ ] Title is present as an H1
- [ ] Table of Contents is present and all links work
- [ ] Chapters are numbered sequentially with `## Chapter N:` format
- [ ] Sections use `### N.M` numbering
- [ ] Steps within sections use numbered lists
- [ ] Every chapter ends with a Recap subsection
- [ ] All code blocks have language tags
- [ ] Code blocks for file contents include file paths
- [ ] Emoji callout blocks use the correct format (⚠️, 💡, 📝, 🚨)
- [ ] Tone is second-person and conversational
- [ ] No bare code blocks without language identifiers
