// Lokální úložiště nezávislé na frameworku. Prohlížeč může přístup odepřít, proto try/catch.

export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Poškozená data se chovají jako prázdná, aplikace kvůli nim nesmí spadnout.
export function readJson(key: string): unknown {
  const raw = readItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
