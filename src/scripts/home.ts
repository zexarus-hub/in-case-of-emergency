import { daysSince, formatCheckAge, loadBagCheck } from '../lib/bagCheck';
import { loadChecklist } from '../lib/checklist';
import { filledSections, loadFamilyPlan, PLAN_SECTION_COUNT } from '../lib/familyPlan';

const plan = loadFamilyPlan();

const meet = document.querySelector<HTMLElement>('[data-meet]');
const place = plan.primaryPlace.trim() || plan.backupPlace.trim();
if (meet && place) {
  meet.querySelector('[data-meet-place]')!.textContent = place;
  meet.hidden = false;
}

const readiness = document.querySelector<HTMLElement>('[data-readiness]');
if (readiness) {
  const keys: string[] = JSON.parse(readiness.dataset.supplies ?? '[]');
  const checked = loadChecklist().checked;
  const done = keys.filter((key) => checked[key]).length;
  const percent = keys.length ? Math.round((done / keys.length) * 100) : 0;
  const sections = filledSections(plan);
  const bag = loadBagCheck();

  const set = (name: string, value: string, fill?: number) => {
    readiness.querySelector(`[data-stat="${name}"]`)!.textContent = value;
    const bar = readiness.querySelector<HTMLElement>(`[data-bar="${name}"]`);
    if (bar && fill !== undefined) bar.style.width = `${fill}%`;
  };

  set('supplies', `${percent} %`, percent);
  set('plan', `${sections} z ${PLAN_SECTION_COUNT}`, (sections / PLAN_SECTION_COUNT) * 100);
  set('bag', bag ? formatCheckAge(daysSince(bag.lastChecked)) : 'Bez kontroly');
  readiness.hidden = false;
}
