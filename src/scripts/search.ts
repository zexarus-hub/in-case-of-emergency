import { searchEntries, type SearchEntry } from '../lib/search';

const input = document.querySelector<HTMLInputElement>('[data-search-input]');
const list = document.querySelector<HTMLUListElement>('[data-search-results]');
const empty = document.querySelector<HTMLElement>('[data-search-empty]');
const hints = document.querySelector<HTMLElement>('[data-search-hints]');
const entries: SearchEntry[] = JSON.parse(document.getElementById('search-data')?.textContent ?? '[]');

function render() {
  if (!input || !list || !empty || !hints) return;
  const query = input.value.trim();
  const results = searchEntries(entries, query);
  hints.hidden = query !== '';
  empty.hidden = query === '' || results.length > 0;
  // Vše se skládá přes textContent, takže text z dotazu ani obsahu nemůže vložit HTML.
  list.replaceChildren(
    ...results.map(({ entry, snippet }) => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      const page = document.createElement('small');
      page.textContent = entry.page;
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const text = document.createElement('span');
      text.textContent = snippet;
      link.append(page, title, text);
      const item = document.createElement('li');
      item.append(link);
      return item;
    }),
  );
}

input?.addEventListener('input', render);
hints?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest('button');
  if (!button || !input) return;
  input.value = button.textContent?.trim() ?? '';
  render();
});
render();
