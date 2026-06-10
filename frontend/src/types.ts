export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipmentType: string;
  defaultRestPeriod: number;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  weight: number;
  exercise: {
    name: string;
    muscleGroup: string;
    defaultRestPeriod: number;
  };
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  routineExercises: RoutineExercise[];
}

export interface SetRecord {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  defaultRestPeriod: number;
  sets: SetRecord[];
}

export interface DashboardStats {
  totalWorkouts: number;
  totalVolume: number;
  volumeOverTime: Array<{ date: string; volume: number; name: string }>;
  frequencyData: Array<{ week: string; count: number }>;
  muscleData: Array<{ subject: string; A: number; fullMark: number }>;
}

export interface OneRepMaxHistory {
  exerciseName: string;
  history: Array<{ date: string; oneRepMax: number }>;
}
