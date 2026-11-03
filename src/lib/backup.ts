import { CHECKLIST_KEY, isChecklistState } from './checklist';
import { readItem, readJson, removeItem, writeItem } from './storage';

const APP_ID = 'krizova-prirucka';
const BACKUP_VERSION = 1;

export const MAX_BACKUP_BYTES = 1024 * 1024;
// Po obnovení zálohy si ostrůvky podle této události znovu načtou svá data.
export const RESTORED_EVENT = 'backup:restored';

// Co všechno záloha obsahuje a jak se to kontroluje. Motiv je nastavení zařízení, proto v záloze není.
const VALIDATORS: Record<string, (value: unknown) => boolean> = {
  [CHECKLIST_KEY]: isChecklistState,
};

export interface Backup {
  app: string;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export type ParseResult = { ok: true; backup: Backup } | { ok: false; error: string };

export function createBackup(now = new Date()): Backup {
  const data: Record<string, unknown> = {};
  for (const [key, isValid] of Object.entries(VALIDATORS)) {
    const value = readJson(key);
    if (isValid(value)) data[key] = value;
  }
  return { app: APP_ID, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

export function backupFileName(now = new Date()): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `krizova-prirucka-zaloha-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

export function parseBackup(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Soubor nejde přečíst. Vyber zálohu z této aplikace.' };
  }
  if (typeof parsed !== 'object' || parsed === null || (parsed as Backup).app !== APP_ID) {
    return { ok: false, error: 'Tento soubor není záloha z této aplikace.' };
  }
  const { version, exportedAt, data } = parsed as Backup;
  if (typeof version !== 'number' || version < 1) {
    return { ok: false, error: 'Záloha je poškozená.' };
  }
  if (version > BACKUP_VERSION) {
    return { ok: false, error: 'Záloha je z novější verze aplikace. Nejdřív aplikaci aktualizuj.' };
  }
  if (typeof exportedAt !== 'string' || Number.isNaN(Date.parse(exportedAt))) {
    return { ok: false, error: 'Záloha je poškozená.' };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Záloha je poškozená.' };
  }
  // Neznámé klíče se zahodí, do úložiště se nikdy nezapíše nic nezkontrolovaného.
  const known: Record<string, unknown> = {};
  for (const [key, isValid] of Object.entries(VALIDATORS)) {
    if (!Object.hasOwn(data, key)) continue;
    const value = (data as Record<string, unknown>)[key];
    if (!isValid(value)) return { ok: false, error: 'Záloha je poškozená.' };
    known[key] = value;
  }
  return { ok: true, backup: { app: APP_ID, version, exportedAt, data: known } };
}

// Zapíše buď všechno, nebo nic: při chybě vrátí původní data.
export function restoreBackup(backup: Backup): boolean {
  const previous = new Map(Object.keys(backup.data).map((key) => [key, readItem(key)]));
  for (const [key, value] of Object.entries(backup.data)) {
    if (writeItem(key, JSON.stringify(value))) continue;
    for (const [oldKey, oldValue] of previous) {
      if (oldValue === null) removeItem(oldKey);
      else writeItem(oldKey, oldValue);
    }
    return false;
  }
  return true;
}
