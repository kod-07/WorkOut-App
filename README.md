# FlexFlow 🏋️‍♂️

FlexFlow is a production-ready, comprehensive Fitness Tracker Web Application. It features a responsive layout designed for both mobile screens (touch-optimized tab interfaces) and laptops (multi-column dashboard visualizations), supported by a modular NestJS API backend and a Prisma SQLite relational database.

---

## 🏗️ Architecture Overview

The system is organized as a decoupled monorepo:
* **Backend (Root):** NestJS (TypeScript) with Prisma Client, implementing modular separation (`AuthModule`, `ExercisesModule`, `WorkoutsModule`, `AnalyticsModule`), class-validator DTO check pipes, custom exception filters, and JWT guards.
* **Frontend (`/frontend`):** React (Vite + TypeScript), styled using Tailwind CSS v3, utilizing Lucide React icons, Axios, and Recharts for premium analytics.

---

## 🗄️ Database Model

```mermaid
erDiagram
    User ||--o{ WorkoutRoutine : "creates"
    User ||--o{ WorkoutLog : "logs"
    Exercise ||--o{ RoutineExercise : "included-in"
    Exercise ||--o{ SetLog : "recorded-in"
    WorkoutRoutine ||--o{ RoutineExercise : "has"
    WorkoutRoutine ||--o{ WorkoutLog : "instantiated-by"
    WorkoutLog ||--o{ SetLog : "contains"

    User {
        string id PK
        string email UNIQUE
        string passwordHash
        datetime createdAt
    }

    Exercise {
        string id PK
        string name UNIQUE
        string muscleGroup
        string equipmentType
        int defaultRestPeriod
    }

    WorkoutRoutine {
        string id PK
        string userId FK
        string name
        string description
        datetime createdAt
    }

    RoutineExercise {
        string id PK
        string routineId FK
        string exerciseId FK
        int order
        int sets
        int reps
        float weight
    }

    WorkoutLog {
        string id PK
        string userId FK
        string routineId FK
        datetime startTime
        datetime endTime
        string notes
    }

    SetLog {
        string id PK
        string workoutLogId FK
        string exerciseId FK
        int setNumber
        float weight
        int reps
        boolean isCompleted
    }
```

---

## 🚀 Quick Start Instructions

Follow these steps to run both parts of the application locally:

### 1. Database Setup (SQLite)
Run the following from the root workspace directory to synchronize the database schema and generate the Prisma Client:
```bash
npm run db:push
```
*The database file will be created locally at `prisma/dev.db`.*

### 2. Start the Backend API (NestJS)
Run the following from the root workspace directory:
```bash
# Start backend in development mode (listens on http://localhost:3000)
npm run start:dev
```

### 3. Start the Frontend Application (Vite + React)
Open a new terminal window, navigate to the `/frontend` directory, and run:
```bash
cd frontend
# Start the Vite development server (listens on http://localhost:5173)
npm run dev
```

---

## 📋 Key Features & Implementation Highlights

### 1. High-Performance Workout Timers
* **Background-Safe Stopwatch:** Uses persistent timestamp references cached in `localStorage` to compute exact durations, remaining resilient against browser crashes or page reloads.
* **Auto-Triggered Rest Timer:** Automatically loads countdown overlay upon ticking off a completed set. Includes custom extension buttons (+30s) and native browser **Web Audio API double-beep audio cues** upon expiration (no asset downloads required!).

### 2. Dashboard Analytics & 1RM Progress (Recharts)
* **Training Volume Area Chart:** Displays cumulative weight lifted per workout session.
* **Muscle Group Radar Split:** Maps relative set counts across primary targets (Chest, Back, Legs, etc.) to highlight training imbalances.
* **Weekly Frequency Bar Chart:** Renders workout volume per calendar week.
* **1-Rep Max Line History:** Select specific exercises and filter history ranges (7 days, 30 days, 90 days) to track strength progress calculated via the **Epley 1RM formula**:  
  $$\text{1RM} = \text{Weight} \times \left(1 + \frac{\text{Reps}}{30}\right)$$

### 3. Mobile-First UX Layout
* Minimum touch targets of **48x48px** for all checkboxes, count buttons, and tabs.
* Smooth bottom navigation tab bars for mobile, converting to static left sidebars on desktop resolutions.
