import { readJson, writeItem } from './storage';

export const CHECKLIST_KEY = 'checklist';
export const MIN_PERSONS = 1;
export const MAX_PERSONS = 20;

export interface ChecklistState {
  persons: number;
  checked: Record<string, boolean>;
}

export function isChecklistState(value: unknown): value is ChecklistState {
  if (typeof value !== 'object' || value === null) return false;
  const { persons, checked } = value as Partial<ChecklistState>;
  return (
    Number.isInteger(persons) &&
    (persons as number) >= MIN_PERSONS &&
    (persons as number) <= MAX_PERSONS &&
    typeof checked === 'object' &&
    checked !== null &&
    !Array.isArray(checked) &&
    Object.values(checked).every((item) => typeof item === 'boolean')
  );
}

export function emptyChecklist(): ChecklistState {
  return { persons: MIN_PERSONS, checked: {} };
}

export function loadChecklist(): ChecklistState {
  const stored = readJson(CHECKLIST_KEY);
  return isChecklistState(stored) ? stored : emptyChecklist();
}

export function saveChecklist(state: ChecklistState): boolean {
  return writeItem(CHECKLIST_KEY, JSON.stringify(state));
}

export function clampPersons(persons: number): number {
  return Math.min(MAX_PERSONS, Math.max(MIN_PERSONS, persons));
}

// Např. 1,5 l na osobu pro 3 osoby: „4,5 l“ (s nezlomitelnou mezerou).
export function formatQuantity(perPerson: number, unit: string, persons: number): string {
  const total = Math.round(perPerson * persons * 100) / 100;
  return `${total.toLocaleString('cs-CZ')} ${unit}`;
}
