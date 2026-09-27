// src/utils/resolveDraft.ts
import type { Exercise, ExerciseType } from '@/types/exercise';
import type { DraftExercise } from '@/types/workouts';

export interface ResolvedDraftExercise extends DraftExercise {
    name: string;
    type: ExerciseType;
    color: string;
}

export function resolveDraft(
    draft: DraftExercise[],
    allExercises: Exercise[],
): ResolvedDraftExercise[] {
    const byId = new Map(allExercises.map((e) => [e.id, e]));
    return draft
        .map((d) => {
            const ex = byId.get(d.exercise_id);
            if (!ex) return null;
            return {
                ...d,
                name: ex.name,
                type: ex.type,
                color: ex.color,
            };
        })
        .filter((x): x is ResolvedDraftExercise => x !== null);
}
