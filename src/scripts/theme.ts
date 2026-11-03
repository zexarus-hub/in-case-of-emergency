import { readItem, writeItem } from '../lib/storage';

const KEY = 'theme';
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

function apply(theme: string) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000');
  button?.setAttribute('aria-label', theme === 'light' ? 'Přepnout na tmavý režim' : 'Přepnout na světlý režim');
}

// Velikost textu je stejně jako motiv nastavení zařízení, proto není v záloze.
const SIZE_KEY = 'text-size';
const sizeControl = document.querySelector<HTMLElement>('[data-text-size-control]');

if (sizeControl) {
  const buttons = [...sizeControl.querySelectorAll<HTMLButtonElement>('[data-size]')];
  const applySize = (size: string) => {
    if (size === '100') delete document.documentElement.dataset.textSize;
    else document.documentElement.dataset.textSize = size;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item.dataset.size === size));
  };
  applySize(document.documentElement.dataset.textSize ?? '100');
  sizeControl.hidden = false;
  sizeControl.addEventListener('click', (event) => {
    const size = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-size]')?.dataset.size;
    if (!size) return;
    writeItem(SIZE_KEY, size);
    applySize(size);
  });
}

if (button) {
  apply(readItem(KEY) === 'dark' ? 'dark' : 'light');
  button.hidden = false;
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    writeItem(KEY, next);
    apply(next);
  });
}
