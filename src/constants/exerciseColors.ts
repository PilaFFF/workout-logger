// src/constants/exerciseColors.ts
export const EXERCISE_COLORS = [
    '#a0d37f',
    '#e77d7e',
    '#cca2ee',
    '#66baec',
    '#ffab00',
] as const;

export type ExerciseColor = (typeof EXERCISE_COLORS)[number];
export const DEFAULT_EXERCISE_COLOR: ExerciseColor = EXERCISE_COLORS[0];
