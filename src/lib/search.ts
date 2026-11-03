export interface SearchEntry {
  title: string;
  page: string;
  url: string;
  text: string;
}

export interface SearchResult {
  entry: SearchEntry;
  snippet: string;
}

const SNIPPET_LENGTH = 110;

// Čeština bez diakritiky a velkých písmen, aby šlo hledat i jednou rukou a bez háčků.
// Délka textu se nemění, takže pozice nálezu platí i pro původní text.
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/\p{L}/gu, (char) => char.normalize('NFD').charAt(0));
}

// Delším slovům se uříznou koncovky, aby se našly i jiné pády („popáleniny“ i „popálenin“).
function toTerms(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => (term.length >= 6 ? term.slice(0, -2) : term));
}

function makeSnippet(entry: SearchEntry, terms: string[]): string {
  const normalized = normalize(entry.text);
  const positions = terms.map((term) => normalized.indexOf(term)).filter((position) => position >= 0);
  const hit = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, hit - 30);
  const snippet = entry.text.slice(start, start + SNIPPET_LENGTH).trim();
  return `${start > 0 ? '…' : ''}${snippet}${start + SNIPPET_LENGTH < entry.text.length ? '…' : ''}`;
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 20): SearchResult[] {
  const terms = toTerms(query);
  if (terms.length === 0) return [];
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const title = normalize(entry.title);
    const page = normalize(entry.page);
    const text = normalize(entry.text);
    let score = 0;
    for (const term of terms) {
      const inTitle = title.includes(term);
      const inPage = page.includes(term);
      const inText = text.includes(term);
      if (!inTitle && !inPage && !inText) {
        score = -1;
        break;
      }
      score += (inTitle ? 10 : 0) + (inPage ? 5 : 0) + (inText ? 1 : 0);
    }
    if (score > 0) scored.push({ entry, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => ({ entry, snippet: makeSnippet(entry, terms) }));
}
