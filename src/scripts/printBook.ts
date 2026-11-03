import { formatCheckDate, loadBagCheck } from '../lib/bagCheck';
import { CHECKLIST_KEY, formatQuantity, loadChecklist } from '../lib/checklist';
import { filledSections, loadFamilyPlan, PLAN_SECTION_COUNT } from '../lib/familyPlan';

// Vše se doplňuje přes textContent, aby uložený text nemohl vložit HTML.
for (const list of document.querySelectorAll<HTMLElement>('.print-checklist')) {
  const state = loadChecklist(list.dataset.storage);
  for (const box of list.querySelectorAll<HTMLElement>('[data-key]')) {
    box.textContent = state.checked[box.dataset.key ?? ''] ? 'X' : '';
  }
  const persons = list.querySelector('[data-persons]');
  if (persons) persons.textContent = String(state.persons);
  for (const amount of list.querySelectorAll<HTMLElement>('[data-per-person]')) {
    amount.textContent = formatQuantity(Number(amount.dataset.perPerson), amount.dataset.unit ?? '', state.persons);
  }
}

const bag = loadBagCheck();
const bagDate = document.querySelector('[data-bag-date]');
if (bag && bagDate) bagDate.textContent = formatCheckDate(bag.lastChecked);

const printDate = document.querySelector('[data-print-date]');
if (printDate) printDate.textContent = `Vytištěno: ${new Date().toLocaleDateString('cs-CZ')}`;

const ticked = Object.values(loadChecklist(CHECKLIST_KEY).checked).filter(Boolean).length;
const suppliesStatus = document.querySelector('[data-screen-supplies]');
if (suppliesStatus) suppliesStatus.textContent = ticked ? 'včetně tvých zaškrtnutí' : 'zatím bez zaškrtnutí';
const planStatus = document.querySelector('[data-screen-plan]');
if (planStatus) planStatus.textContent = `vyplněno ${filledSections(loadFamilyPlan())} z ${PLAN_SECTION_COUNT} částí`;

document.querySelector('[data-print-all]')?.addEventListener('click', () => window.print());
