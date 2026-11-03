// Odškrtávání kroků na stránce situace. Platí jen pro aktuální relaci, po zavření aplikace se vynuluje.
const KEY = `steps:${location.pathname}`;
const list = document.querySelector<HTMLOListElement>('.prose ol');

function readDone(): number[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => Number.isInteger(value)) : [];
  } catch {
    return [];
  }
}

function writeDone(done: number[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(done));
  } catch {
    // Bez úložiště odškrtnutí platí jen do opuštění stránky.
  }
}

if (list) {
  const items = [...list.children] as HTMLLIElement[];
  const done = new Set(readDone());

  const progress = document.createElement('div');
  progress.className = 'step-progress no-print';
  const label = document.createElement('strong');
  const bar = document.createElement('div');
  bar.className = 'progress';
  const fill = document.createElement('span');
  bar.append(fill);
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'step-reset';
  reset.textContent = 'Začít znovu';
  progress.append(label, bar, reset);
  list.before(progress);
  list.classList.add('steps-on');

  const buttons = items.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'step-toggle';
    button.textContent = String(index + 1);
    button.setAttribute('aria-label', `Krok ${index + 1} hotovo`);
    item.prepend(button);
    return button;
  });

  function update() {
    items.forEach((item, index) => {
      item.classList.toggle('step-done', done.has(index));
      buttons[index].setAttribute('aria-pressed', String(done.has(index)));
    });
    label.textContent = `${done.size} z ${items.length} hotovo`;
    fill.style.width = `${(done.size / items.length) * 100}%`;
    reset.hidden = done.size === 0;
  }

  function toggle(index: number) {
    if (done.has(index)) done.delete(index);
    else done.add(index);
    writeDone([...done]);
    update();
    // Jemná odezva jen po skutečném klepnutí. iPhone vibraci z webu nepodporuje.
    if (navigator.userActivation?.isActive) navigator.vibrate?.(10);
  }

  // Odškrtnout jde celá karta, jen odkazy uvnitř kroku dál fungují jako odkazy.
  list.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('a')) return;
    const item = target.closest('li');
    if (item) toggle(items.indexOf(item as HTMLLIElement));
  });

  reset.addEventListener('click', () => {
    done.clear();
    writeDone([]);
    update();
  });

  update();
}
