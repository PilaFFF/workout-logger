// src/db/init.ts
import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!dbInstance) {
        throw new Error(
            'Database not initialized. Call initializeDatabase() first.',
        );
    }
    return dbInstance;
}

export async function initializeDatabase(): Promise<void> {
    if (dbInstance) return;

    // Используем асинхронное открытие — оно безопаснее и не блокирует поток
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

    // Миграция: добавляем color, если её нет
    const columns = await dbInstance.getAllAsync<{ name: string }>(
        'PRAGMA table_info(exercises)',
    );
    if (!columns.some((c) => c.name === 'color')) {
        await dbInstance.execAsync(
            `ALTER TABLE exercises ADD COLUMN color TEXT NOT NULL DEFAULT '#a0d37f';`,
        );
        await dbInstance.execAsync(
            `UPDATE exercises SET color = '#a0d37f' WHERE color IS NULL OR color = '';`,
        );
    }
}
