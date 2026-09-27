// src/types/workout.ts
import type { ExerciseType } from './exercise';

export interface SetEntry {
    id: string;
    reps: number;
    weight: number;
}

export interface DraftExercise {
    exercise_id: number; // только id
    sets: SetEntry[];
}

export interface WorkoutExercise {
    id: number;
    workout_id: number;
    exercise_id: number;
    name: string;
    type: ExerciseType;
    color: string;
    sort_order: number;
    sets: SetEntry[];
}

export interface Workout {
    id: number;
    name: string;
    date: string;
    exercises: WorkoutExercise[];
}

export interface CreateWorkoutInput {
    name: string;
    date: string;
    exercises: Array<{
        exercise_id: number;
        sets: Array<{ reps: number; weight: number }>;
    }>;
}
