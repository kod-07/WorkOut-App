You are an expert full-stack engineer specializing in NestJS (backend) and React (frontend). Build a comprehensive, production-ready Fitness Tracker Web Application optimized for both mobile screens (touch-friendly, compact) and laptops (multi-column dashboard). 

### 🛠️ Tech Stack Constraints
- **Frontend:** React (TypeScript), Tailwind CSS (for fully responsive design), Lucide React (icons), Recharts or Chart.js (for analytics).
- **Backend:** NestJS (TypeScript), TypeORM or Prisma, PostgreSQL (or SQLite for local testing).
- **State Management & API:** React Query (TanStack Query) or Axios with clean custom hooks.

### 📋 Core Features & Requirements

#### 1. Responsive UI/UX (Mobile & Desktop)
- Implement a mobile-first responsive navigation bar (bottom tab bar on mobile, left sidebar on desktop).
- Use a clean, modern dashboard layout with card components that wrap seamlessly on smaller Viewports.
- All interactive elements (buttons, logs) must have a minimum touch target of 48x48px on mobile.

#### 2. Exercise & Workout Management
- **Exercise Library:** A view to browse, search, and add exercises with categories (Muscle group: Arms, Back, Legs; Type: Weighted, Bodyweight).
- **Workout Routine Builder:** Ability to group exercises into a "Routine" (e.g., "Pull Day", "Leg Day").
- **Active Workout Logger:** A responsive interface to log a workout session in real-time. Users should be able to input Sets, Reps, and Weight (with 1-click increment/decrement buttons for quick mobile entry).

#### 3. High-Performance Workout Timers
- **Rest Timer:** An interactive countdown timer that triggers automatically after checking off a completed set.
- **Stopwatch / AMRAP Timer:** A global background-safe timer tracking total workout duration.
- Visual and audio cues (using native browser Web Audio API or simple synth sounds) when the timer hits zero.

#### 4. Progress Reports & Advanced Visualizations
- **Dashboard Analytics:** Visualizations tracking total volume lifted over time, workout frequency per week, and muscle group distribution (e.g., a radar chart showing Arms vs. Back vs. Legs split).
- **1-Rep Max (1RM) Progress Lines:** A line chart displaying historical progress for specific compound movements over a selectable time range (7 days, 30 days, 90 days).

### 🗄️ Database Schema & Data Models
Generate a clean relational database schema including the following entities:
- `User`: ID, email, passwordHash, createdAt.
- `Exercise`: ID, name, muscleGroup (enum), equipmentType, defaultRestPeriod.
- `WorkoutRoutine`: ID, userId, name, description, createdAt (Has many RoutineExercises).
- `WorkoutLog`: ID, userId, routineId, startTime, endTime, notes.
- `SetLog`: ID, workoutLogId, exerciseId, setNumber, weight, reps, isCompleted.

### 🏗️ Architecture & Implementation Guidelines
1. **Backend (NestJS):** Provide modular code architecture (`AuthModule`, `ExercisesModule`, `WorkoutsModule`, `AnalyticsModule`). Implement JWT-based authentication, validation pipes for all incoming payloads (DTOs), and centralized error handling filters.
2. **Frontend (React):** Separate components cleanly into `/components/ui` (reusable buttons, inputs), `/components/workout` (timer, logger), and `/pages` (Dashboard, Analytics, Library). Ensure full TypeScript compliance without using `any`.
3. **Data Fetching:** Configure React Query cache invalidation so that saving a workout log instantly updates the analytics dashboard metrics without requiring a full page reload.

Provide the complete file structure, database migration scripts or schemas, core backend service/controller code, and key frontend components to make this app fully functional.