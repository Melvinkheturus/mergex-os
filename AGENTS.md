<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Using React

- Use functional components with React Hooks.
- For client-side interactive components (forms, dynamic inputs, charts) use the React dev server.
- Do not use Client Components unless necessary.
- Do not use server actions.

# Routing

- Use the App Router.
- Do not use the Pages Router.
- Routes should be defined in the app directory, using the App Router file naming conventions.
- Route Handlers should be defined as async functions inside the route directories.

# Data Fetching

- For server-side data fetching, use async Server Components and nested async components.
- For client-side data fetching use React Hooks (e.g. useState, useEffect, SWR, React Query).
- Do not use client-side hooks for data fetching unless necessary.

# Styling

- Use Tailwind CSS for styling.
- Use CSS modules for component-scoped styles.
- Do not use global CSS files.

# Forms and Client Input

- Use React Hook Form and Zod for form handling.
- For interactive components, use the React dev server and client-side JavaScript.

# Components and UI

- Write modular and reusable components.
- Use TypeScript for type safety.
- Follow the TypeScript conventions (see below).

# TypeScript

- Always use TypeScript.
- Ensure types are correctly inferred.
- Avoid `any` types; use `unknown` when type is genuinely not known.
- Use generics where appropriate.
- Do not use `ts-expect-error` or `// eslint-disable-next-line` comments to suppress type errors.
- Do not disable type-checking rules in ESLint or TypeScript configuration.
- If there's a type error, fix the type definition or code logic, not the type check rule.

# When to Use Each Tool

- **React Dev Server**: For client-side interactive components, forms, dynamic inputs, charts, and client-side data fetching.
- **Next.js App Router**: For routing and server-side data fetching.
- **Server Components**: For rendering static content and fetching server-side data.
- **Tailwind CSS**: For styling all components.

# Coding Style Guide

- Use functional components with React Hooks.
- Use TypeScript for type safety.
- Write clean, modular, and reusable code.
- Do not modify files outside of the src directory.
- Do not modify the node_modules directory.
- Do not modify the .next directory.
- Do not modify .gitignore.
- Only modify files within the src directory.
- Only create new files within the src directory.
