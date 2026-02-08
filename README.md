# Create Tambo App - Tutor AI Dashboard

This is a **Next.js + Supabase + Tambo** template designed to showcase a "Hybrid Architecture" where an AI assistant (powered by Tambo) works alongside a traditional UI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: Tambo SDK (`@tambo-ai/react`, `@tambo-ai/typescript-sdk`)
- **Styling**: Tailwind CSS, Shadcn UI
- **Language**: TypeScript

## Project Overview

This application is a **Tutor Dashboard** that allows users to manage Students, Courses, and Sessions. It demonstrates how to "teach" an AI about your application so it can perform actions and render UI components conversationally.

### Key Concepts

1.  **Hybrid Architecture**: Actions (like adding a student) can be performed via standard UI buttons OR by asking the AI. Both methods use the exact same underlying code.
2.  **Generative UI**: The AI can decide to render rich React components (like tables or forms) in the chat stream instead of just text.
3.  **Interactables**: Standard forms are wrapped to be usable by the AI, ensuring consistency across the app.

## Tambo Architecture

The core integration logic resides in `src/lib/tambo.ts`. This file acts as the registry for the AI's capabilities.

### 1. Tools (Server Actions)

We expose standard Next.js Server Actions as **Tools** to the AI.
-   **Definition**: `src/lib/tambo.ts` -> `tools` array.
-   **Implementation**: `src/app/actions/tutor.ts`.
-   **Example**: `getStudents`, `createStudent`, `updateSession`.
-   **How it works**: When a user asks "Who are my students?", Tambo calls the `getStudents` tool, fetches data from Supabase, and uses the `transformToContent` function to format the result for the chat.

### 2. Generative Components (Read-Only)

We register UI components that the AI can render to display data.
-   **Definition**: `src/lib/tambo.ts` -> `components` array.
-   **Implementation**: `src/components/tutor-dashboard/`.
-   **Example**: `StudentTable`, `SessionTimeline`.
-   **How it works**: If the AI fetches a list of students, it can choose to render `<StudentTable students={...} />` in the chat instead of a text list.

### 3. Interactables (Write/Forms)

We wrap interactive forms so the AI can trigger them.
-   **Definition**: `src/lib/tambo.ts` -> `withInteractable`.
-   **Implementation**: `src/components/tutor-dashboard/CreateStudentForm.tsx`.
-   **Example**: `CreateStudentFormI`.
-   **How it works**:
    -   **User**: Clicks "Add Student" -> Opens `CreateStudentFormI`.
    -   **AI**: User says "Add a student named Alice" -> AI renders `CreateStudentFormI` pre-filled with "Alice".
    -   **State Sync**: The form uses `useTamboComponentState` to keep the AI aware of the user's input in real-time.

## Key Files Map

-   📄 **`src/lib/tambo.ts`**: **The Brain**. Registers all tools, components, and interactables.
-   📄 **`src/app/actions/tutor.ts`**: **The Muscle**. Contains all business logic and database interactions.
-   📄 **`src/app/chat/page.tsx`**: **The Body**. Sets up the `TamboProvider` and initializes the chat interface.
-   📄 **`src/components/tutor-dashboard/*.tsx`**: **The Face**. The UI components used by both the Dashboard and the AI.

## Setup Instructions

1.  **Environment Setup**:
    -   Rename `example.env.local` to `.env.local`.
    -   Add your Tambo API Key: `NEXT_PUBLIC_TAMBO_API_KEY=...` (Get it from [tambo.co/dashboard](https://tambo.co/dashboard)).
    -   Add your Supabase credentials: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to see the app.

4.  **Tambo Init (Optional)**:
    -   Run `npx tambo init` if you want to pull down the latest CLI tools or config.

## Resources

-   [Tambo Documentation](https://docs.tambo.co)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [Supabase Documentation](https://supabase.com/docs)
