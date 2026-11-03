import { readItem, writeItem } from '../lib/storage';

const KEY = 'theme';
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

function apply(theme: string) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000');
  if (button) button.textContent = theme === 'light' ? 'Tmavý režim' : 'Světlý režim';
}

if (button) {
  apply(readItem(KEY) === 'light' ? 'light' : 'dark');
  button.hidden = false;
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    writeItem(KEY, next);
    apply(next);
  });
}
