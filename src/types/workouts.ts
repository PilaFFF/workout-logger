// src/types/workout.ts
import type { ExerciseType } from './exercise';

// ─── Draft (в памяти, ещё не сохранено) ────────────────────────────
export interface SetEntry {
    id: string; // локальный id для React key и поиска
    reps: number;
    weight: number;
}

export interface DraftExercise {
    exercise_id: number;
    sets: SetEntry[];
}

// ─── Сохранённая тренировка (из БД) ────────────────────────────────
export interface WorkoutSet {
    id: number; // id из таблицы workout_sets
    reps: number;
    weight: number;
}

export interface WorkoutExercise {
    id: number; // id из таблицы workout_exercises
    workout_id: number;
    exercise_id: number;
    name: string;
    type: ExerciseType;
    color: string;
    sort_order: number;
    sets: WorkoutSet[];
}

export interface Workout {
    id: number;
    name: string;
    date: string; // ISO
    comment: string;
    exercises: WorkoutExercise[];
}

// ─── Вход для создания ─────────────────────────────────────────────
export interface CreateWorkoutInput {
    name: string;
    date: string; // ISO
    comment: string;
    exercises: Array<{
        exercise_id: number;
        sets: Array<{ reps: number; weight: number }>;
    }>;
}
