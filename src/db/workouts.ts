// src/db/workouts.ts
import type {
    CreateWorkoutInput,
    Workout,
    WorkoutExercise,
} from '@/types/workouts';
import { db } from './init';

interface WorkoutRow {
    id: number;
    name: string;
    date: string;
}

interface WorkoutExerciseRow {
    id: number;
    workout_id: number;
    exercise_id: number;
    name: string;
    type: WorkoutExercise['type'];
    sets: number;
    reps: number;
    weight: number;
    sort_order: number;
}

export function getAllWorkouts(): Workout[] {
    const workouts = db.getAllSync<WorkoutRow>(
        'SELECT id, name, date FROM workouts ORDER BY date DESC',
    );

    return workouts.map((w) => ({
        ...w,
        exercises: getWorkoutExercises(w.id),
    }));
}

export function getWorkoutById(id: number): Workout | null {
    const w = db.getFirstSync<WorkoutRow>(
        'SELECT id, name, date FROM workouts WHERE id = ?',
        [id],
    );
    if (!w) return null;
    return { ...w, exercises: getWorkoutExercises(w.id) };
}

function getWorkoutExercises(workoutId: number): WorkoutExercise[] {
    return db.getAllSync<WorkoutExerciseRow>(
        `SELECT
       we.id,
       we.workout_id,
       we.exercise_id,
       e.name,
       e.type,
       we.sets,
       we.reps,
       we.weight,
       we.sort_order
     FROM workout_exercises we
     JOIN exercises e ON e.id = we.exercise_id
     WHERE we.workout_id = ?
     ORDER BY we.sort_order ASC`,
        [workoutId],
    );
}

export function createWorkout(input: CreateWorkoutInput): number {
    let workoutId = 0;

    db.withTransactionSync(() => {
        const result = db.runSync(
            'INSERT INTO workouts (name, date) VALUES (?, ?)',
            [input.name, input.date],
        );
        workoutId = result.lastInsertRowId;

        input.exercises.forEach((ex, index) => {
            db.runSync(
                `INSERT INTO workout_exercises
           (workout_id, exercise_id, sets, reps, weight, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [workoutId, ex.exercise_id, ex.sets, ex.reps, ex.weight, index],
            );
        });
    });

    return workoutId;
}

export function deleteWorkout(id: number): void {
    db.runSync('DELETE FROM workouts WHERE id = ?', [id]);
}
