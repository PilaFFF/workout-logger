// src/db/init.ts
import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!dbInstance) {
        throw new Error(
            'Database not initialized. Call initializeDatabase() first.'
        );
    }
    return dbInstance;
}

export async function initializeDatabase(): Promise<void> {
    if (dbInstance) return;

    dbInstance = await SQLite.openDatabaseAsync('workout.db');

    await dbInstance.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('weighted', 'assisted', 'bodyweight')),
      description TEXT DEFAULT '',
      color TEXT NOT NULL DEFAULT '#a0d37f',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

    await migrateExercisesColor();
    await migrateWorkoutsComment();
}

async function migrateExercisesColor(): Promise<void> {
    const db = dbInstance!;
    const columns = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(exercises)'
    );
    if (columns.some((c) => c.name === 'color')) return;

    await db.execAsync(
        `ALTER TABLE exercises ADD COLUMN color TEXT NOT NULL DEFAULT '#a0d37f';`
    );
    await db.execAsync(
        `UPDATE exercises SET color = '#a0d37f' WHERE color IS NULL OR color = '';`
    );
}

async function migrateWorkoutsComment(): Promise<void> {
    const db = dbInstance!;
    const columns = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(workouts)'
    );
    if (columns.some((c) => c.name === 'comment')) return;

    await db.execAsync(
        `ALTER TABLE workouts ADD COLUMN comment TEXT NOT NULL DEFAULT '';`
    );
}
