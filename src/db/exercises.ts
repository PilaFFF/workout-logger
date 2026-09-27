// src/db/exercises.ts
import type {
    CreateExerciseInput,
    Exercise,
    UpdateExerciseInput,
} from '@/types/exercise';
import { getDatabase } from './init';

export function getAllExercises(): Exercise[] {
    const db = getDatabase();
    return db.getAllSync<Exercise>(
        'SELECT id, name, type, description, color FROM exercises ORDER BY name',
    );
}

export function getExercisesBySearch(query: string): Exercise[] {
    const db = getDatabase();
    const q = `%${query}%`;
    return db.getAllSync<Exercise>(
        'SELECT id, name, type, description, color FROM exercises WHERE name LIKE ? ORDER BY name',
        [q],
    );
}

export function createExercise(input: CreateExerciseInput): number {
    const db = getDatabase();
    const result = db.runSync(
        'INSERT INTO exercises (name, type, description, color) VALUES (?, ?, ?, ?)',
        [input.name, input.type, input.description, input.color],
    );
    return result.lastInsertRowId;
}

export function updateExercise(input: UpdateExerciseInput): void {
    const db = getDatabase();
    const existing = db.getFirstSync<Exercise>(
        'SELECT id, name, type, description, color FROM exercises WHERE id = ?',
        [input.id],
    );
    if (!existing) throw new Error(`Exercise ${input.id} not found`);

    db.runSync(
        'UPDATE exercises SET name = ?, type = ?, description = ?, color = ? WHERE id = ?',
        [
            input.name ?? existing.name,
            input.type ?? existing.type,
            input.description ?? existing.description,
            input.color ?? existing.color,
            input.id,
        ],
    );
}

export function deleteExercise(id: number): void {
    const db = getDatabase();
    db.runSync('DELETE FROM exercises WHERE id = ?', [id]);
}
