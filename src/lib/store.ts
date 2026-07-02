import { writable } from 'svelte/store';

export type SceneType = 'intro' | 1 | 2 | 3 | 'outro';

export const currentScene = writable<SceneType>('intro');
export const currentStep = writable<number>(1);
