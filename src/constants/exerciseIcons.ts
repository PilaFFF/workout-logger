// src/constants/exerciseIcons.ts
import type { ExerciseType } from '@/types/exercise';
import type { Ionicons } from '@expo/vector-icons';

export const EXERCISE_TYPE_ICONS: Record<
    ExerciseType,
    keyof typeof Ionicons.glyphMap
> = {
    weighted: 'add-circle-outline',
    assisted: 'remove-circle-outline',
    bodyweight: 'person-outline',
};
