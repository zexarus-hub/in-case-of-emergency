import { readJson, writeItem } from './storage';

export const FAMILY_PLAN_KEY = 'family-plan';

export interface Contact {
  name: string;
  phone: string;
  note: string;
}

export interface Pickup {
  person: string;
  pickedUpBy: string;
}

export interface FamilyPlan {
  contacts: Contact[];
  primaryPlace: string;
  backupPlace: string;
  routeCar: string;
  routeFoot: string;
  timeRules: string;
  pickups: Pickup[];
  keyLocation: string;
  suppliesLocation: string;
}

export const emptyContact = (): Contact => ({ name: '', phone: '', note: '' });
export const emptyPickup = (): Pickup => ({ person: '', pickedUpBy: '' });

// Prázdná šablona. Skutečná data žijí jen v zařízení a v exportované záloze.
export function emptyFamilyPlan(): FamilyPlan {
  return {
    contacts: [emptyContact()],
    primaryPlace: '',
    backupPlace: '',
    routeCar: '',
    routeFoot: '',
    timeRules: '',
    pickups: [emptyPickup()],
    keyLocation: '',
    suppliesLocation: '',
  };
}

function hasStrings(value: unknown, keys: string[]): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return keys.every((key) => typeof (value as Record<string, unknown>)[key] === 'string');
}

const isRows = (value: unknown, keys: string[]) => Array.isArray(value) && value.every((row) => hasStrings(row, keys));

export function isFamilyPlan(value: unknown): value is FamilyPlan {
  if (!hasStrings(value, ['primaryPlace', 'backupPlace', 'routeCar', 'routeFoot', 'timeRules', 'keyLocation', 'suppliesLocation'])) {
    return false;
  }
  const { contacts, pickups } = value as FamilyPlan;
  return isRows(contacts, ['name', 'phone', 'note']) && isRows(pickups, ['person', 'pickedUpBy']);
}

export function loadFamilyPlan(): FamilyPlan {
  const stored = readJson(FAMILY_PLAN_KEY);
  return isFamilyPlan(stored) ? stored : emptyFamilyPlan();
}

export function saveFamilyPlan(plan: FamilyPlan): boolean {
  return writeItem(FAMILY_PLAN_KEY, JSON.stringify(plan));
}

export const PLAN_SECTION_COUNT = 6;
export const hasText = (...values: string[]) => values.some((value) => value.trim() !== '');
export const usedRows = <T extends Contact | Pickup>(rows: T[]) => rows.filter((row) => hasText(...Object.values(row)));

export function filledSections(plan: FamilyPlan): number {
  return [
    usedRows(plan.contacts).length > 0,
    hasText(plan.primaryPlace, plan.backupPlace),
    hasText(plan.routeCar, plan.routeFoot),
    hasText(plan.timeRules),
    usedRows(plan.pickups).length > 0,
    hasText(plan.keyLocation, plan.suppliesLocation),
  ].filter(Boolean).length;
}
