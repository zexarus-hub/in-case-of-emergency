# Krizová příručka

Rodinná offline aplikace (PWA) o tom, co mít připravené a co dělat, když nejde elektřina, chybí pitná voda, teplo nebo běžná pomoc. Po prvním načtení funguje úplně bez internetu.

> **Rozpracováno.** Kapitoly a checklisty zatím obsahují jen zástupný text a ukázkové položky. Aplikaci zatím nepoužívej jako zdroj informací pro skutečnou krizi.

## Co už funguje

- Navigace mezi kapitolami, tmavý režim s čistou černou a volitelný světlý režim.
- Offline provoz přes service worker, který při instalaci uloží všechny stránky a assety.
- Checklist s přepočtem množství podle počtu osob.
- Rodinný plán: kontakty, místa srazu, trasy, časová pravidla, vyzvedávání dětí a starších, klíč a zásoby. Jde vytisknout, i prázdný k vyplnění tužkou.
- Export a import zálohy jako soubor JSON pro přenos mezi telefony.

## Co se připravuje

- Obsah kapitol podle ověřených zdrojů (HZS ČR, Ministerstvo vnitra, Český červený kříž, Státní zdravotní ústav).
- Tisková verze celé příručky.

## Soukromí

Data uživatele zůstávají jen v zařízení v `localStorage`. Aplikace nemá server, analytiku ani externí zdroje. Exportovaná záloha není zašifrovaná.

Skutečná jména, adresy a místa srazu nikdy nepatří do repozitáře. Soubory `*.json` kromě konfigurace projektu jsou proto v `.gitignore`.

## Technologie

[Astro](https://astro.build) se statickým výstupem, ostrůvky ve [Svelte](https://svelte.dev), TypeScript a [`@vite-pwa/astro`](https://github.com/vite-pwa/astro).

## Vývoj

Je potřeba Node.js 22.23.4 nebo novější.

```sh
npm install
npm run dev      # vývojový server
npm run check    # kontrola typů
npm run build    # produkční build do dist/
npm run preview  # náhled produkčního buildu
```

Service worker běží jen v produkčním buildu, takže offline režim testuj přes `npm run build` a `npm run preview`.

## Struktura

```text
src/content/kapitoly/    texty kapitol v Markdownu, každá uvádí zdroj
src/content/checklisty/  položky checklistů v YAML
src/components/          komponenty Astro a ostrůvky Svelte
src/lib/                 ukládání, checklist a záloha v čistém TypeScriptu
src/pages/               stránky
```

## Nasazení

Výstup ze složky `dist/` nahraj na libovolný statický hosting s HTTPS. Pokud aplikace poběží v podsložce, například na GitHub Pages, nastav při buildu její cestu:

```powershell
$env:BASE_PATH = '/in-case-of-emergency/'; npm run build
```

Na telefonu aplikaci nainstaluj jednou s připojením k internetu. Na iPhonu použij Safari a volbu „Přidat na plochu“.
