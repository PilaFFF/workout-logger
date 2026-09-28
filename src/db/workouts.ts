// src/db/workouts.ts
import type { ExerciseType } from '@/types/exercise';
import type {
    CreateWorkoutInput,
    Workout,
    WorkoutExercise,
    WorkoutSet,
} from '@/types/workouts.ts';
import { getDatabase } from './init';

interface WorkoutRow {
    id: number;
    name: string;
    date: string;
    comment: string;
}

interface WorkoutExerciseRow {
    id: number;
    workout_id: number;
    exercise_id: number;
    name: string;
    type: ExerciseType;
    color: string;
    sort_order: number;
}

interface WorkoutSetRow {
    id: number;
    workout_exercise_id: number;
    reps: number;
    weight: number;
    sort_order: number;
}

// ─── Чтение ────────────────────────────────────────────────────────

export function getAllWorkouts(): Workout[] {
    const db = getDatabase();
    const workouts = db.getAllSync<WorkoutRow>(
        'SELECT id, name, date, comment FROM workouts ORDER BY date DESC'
    );
    return workouts.map((w) => ({
        ...w,
        exercises: getWorkoutExercises(w.id),
    }));
}

export function getWorkoutById(id: number): Workout | null {
    const db = getDatabase();
    const w = db.getFirstSync<WorkoutRow>(
        'SELECT id, name, date, comment FROM workouts WHERE id = ?',
        [id]
    );
    if (!w) return null;
    return { ...w, exercises: getWorkoutExercises(w.id) };
}

function getWorkoutExercises(workoutId: number): WorkoutExercise[] {
    const db = getDatabase();
    const rows = db.getAllSync<WorkoutExerciseRow>(
        `SELECT
            we.id,
            we.workout_id,
            we.exercise_id,
            e.name,
            e.type,
            e.color,
            we.sort_order
         FROM workout_exercises we
         JOIN exercises e ON e.id = we.exercise_id
         WHERE we.workout_id = ?
         ORDER BY we.sort_order ASC`,
        [workoutId]
    );

    return rows.map((row) => ({
        ...row,
        sets: getWorkoutSets(row.id),
    }));
}

function getWorkoutSets(workoutExerciseId: number): WorkoutSet[] {
    const db = getDatabase();
    return db.getAllSync<WorkoutSetRow>(
        `SELECT id, workout_exercise_id, reps, weight, sort_order
         FROM workout_sets
         WHERE workout_exercise_id = ?
         ORDER BY sort_order ASC`,
        [workoutExerciseId]
    );
}

// ─── Запись ────────────────────────────────────────────────────────

export function createWorkout(input: CreateWorkoutInput): number {
    const db = getDatabase();
    let workoutId = 0;

    db.withTransactionSync(() => {
        const result = db.runSync(
            'INSERT INTO workouts (name, date, comment) VALUES (?, ?, ?)',
            [input.name, input.date, input.comment]
        );
        workoutId = result.lastInsertRowId;

        input.exercises.forEach((ex, exIndex) => {
            const weResult = db.runSync(
                `INSERT INTO workout_exercises
                    (workout_id, exercise_id, sort_order)
                 VALUES (?, ?, ?)`,
                [workoutId, ex.exercise_id, exIndex]
            );
            const workoutExerciseId = weResult.lastInsertRowId;

            ex.sets.forEach((set, setIndex) => {
                db.runSync(
                    `INSERT INTO workout_sets
                        (workout_exercise_id, reps, weight, sort_order)
                     VALUES (?, ?, ?, ?)`,
                    [workoutExerciseId, set.reps, set.weight, setIndex]
                );
            });
        });
    });

    return workoutId;
}

export function deleteWorkout(id: number): void {
    const db = getDatabase();
    db.runSync('DELETE FROM workouts WHERE id = ?', [id]);
}
