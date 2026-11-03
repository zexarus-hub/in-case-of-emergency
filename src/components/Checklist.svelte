<script lang="ts">
  import { onMount } from 'svelte';
  import { RESTORED_EVENT } from '../lib/backup';
  import {
    CHECKLIST_KEY,
    clampPersons,
    emptyChecklist,
    formatQuantity,
    loadChecklist,
    saveChecklist,
    MAX_PERSONS,
    MIN_PERSONS,
  } from '../lib/checklist';

  interface Item {
    id: string;
    text: string;
    perPerson?: number;
    unit?: string;
  }

  interface Group {
    id: string;
    title: string;
    items: Item[];
  }

  let {
    groups,
    storageKey = CHECKLIST_KEY,
    showPersons = true,
  }: { groups: Group[]; storageKey?: string; showPersons?: boolean } = $props();

  let data = $state(emptyChecklist());
  let saveFailed = $state(false);

  const keyOf = (group: Group, item: Item) => `${group.id}/${item.id}`;
  const doneIn = (group: Group) => group.items.filter((item) => data.checked[keyOf(group, item)]).length;
  const total = $derived(groups.reduce((sum, group) => sum + group.items.length, 0));
  const done = $derived(groups.reduce((sum, group) => sum + doneIn(group), 0));

  function save() {
    saveFailed = !saveChecklist($state.snapshot(data), storageKey);
  }

  function setPersons(persons: number) {
    data.persons = clampPersons(persons);
    save();
  }

  function setChecked(key: string, checked: boolean) {
    data.checked[key] = checked;
    save();
  }

  // Načítá se až v prohlížeči. Na serveru se vykreslí prázdný seznam.
  onMount(() => {
    const reload = () => {
      data = loadChecklist(storageKey);
    };
    reload();
    window.addEventListener(RESTORED_EVENT, reload);
    return () => window.removeEventListener(RESTORED_EVENT, reload);
  });
</script>

{#if saveFailed}
  <p class="notice" role="alert">Změnu se nepodařilo uložit. Po zavření aplikace se ztratí.</p>
{/if}

<div class="card progress-card">
  <p class="progress-text"><strong class="check-total">{done} z {total}</strong> připraveno</p>
  <div class="progress" role="progressbar" aria-label="Připraveno" aria-valuemin="0" aria-valuemax={total} aria-valuenow={done}>
    <span style:width="{total ? (done / total) * 100 : 0}%"></span>
  </div>
  {#if showPersons}
    <div class="stepper" role="group" aria-label="Počet osob">
      <span class="stepper-label">Počet osob</span>
      <button type="button" class="button" aria-label="Ubrat osobu" disabled={data.persons <= MIN_PERSONS} onclick={() => setPersons(data.persons - 1)}>−</button>
      <output class="stepper-value" aria-live="polite">{data.persons}</output>
      <button type="button" class="button" aria-label="Přidat osobu" disabled={data.persons >= MAX_PERSONS} onclick={() => setPersons(data.persons + 1)}>+</button>
    </div>
  {/if}
</div>

{#each groups as group (group.id)}
  <section class="check-group">
    <h2>{group.title} <span class="check-count">{doneIn(group)} z {group.items.length}</span></h2>
    <ul class="check-list">
      {#each group.items as item (item.id)}
        {@const key = keyOf(group, item)}
        <li>
          <label class="check-item">
            <input type="checkbox" checked={data.checked[key] ?? false} onchange={(event) => setChecked(key, event.currentTarget.checked)} />
            <span class="check-text">{item.text}</span>
            {#if item.perPerson && item.unit}
              <strong class="check-amount">{formatQuantity(item.perPerson, item.unit, data.persons)}</strong>
            {/if}
          </label>
        </li>
      {/each}
    </ul>
  </section>
{/each}
