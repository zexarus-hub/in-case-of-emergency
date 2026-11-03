<script lang="ts">
  import { onMount } from 'svelte';
  import { RESTORED_EVENT } from '../lib/backup';
  import FamilyPlanPrint from './FamilyPlanPrint.svelte';
  import {
    emptyContact,
    emptyFamilyPlan,
    emptyPickup,
    filledSections,
    hasText,
    loadFamilyPlan,
    PLAN_SECTION_COUNT,
    saveFamilyPlan,
    usedRows,
  } from '../lib/familyPlan';

  let plan = $state(emptyFamilyPlan());
  let mode = $state<'view' | 'edit'>('edit');
  let saveFailed = $state(false);

  function save() {
    saveFailed = !saveFamilyPlan($state.snapshot(plan));
  }

  function addContact() {
    plan.contacts.push(emptyContact());
    save();
  }

  function removeContact(index: number) {
    plan.contacts.splice(index, 1);
    save();
  }

  function addPickup() {
    plan.pickups.push(emptyPickup());
    save();
  }

  function removePickup(index: number) {
    plan.pickups.splice(index, 1);
    save();
  }

  const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

  const contacts = $derived(usedRows(plan.contacts));
  const pickups = $derived(usedRows(plan.pickups));
  const sections = $derived(filledSections(plan));

  // Načítá se až v prohlížeči. Na serveru se vykreslí prázdná šablona.
  onMount(() => {
    const reload = () => {
      plan = loadFamilyPlan();
      // Vyplněný plán se v krizi hlavně čte, proto se otevře rovnou pro čtení.
      mode = filledSections(plan) > 0 ? 'view' : 'edit';
    };
    reload();
    window.addEventListener(RESTORED_EVENT, reload);
    return () => window.removeEventListener(RESTORED_EVENT, reload);
  });
</script>

{#if saveFailed}
  <p class="notice no-print" role="alert">Změnu se nepodařilo uložit. Po zavření aplikace se ztratí. Plán si vytiskni nebo opiš.</p>
{/if}

<div class="plan-controls no-print">
  <div class="segmented" role="group" aria-label="Režim plánu">
    <button type="button" aria-pressed={mode === 'view'} onclick={() => (mode = 'view')}>Zobrazit</button>
    <button type="button" aria-pressed={mode === 'edit'} onclick={() => (mode = 'edit')}>Upravit</button>
  </div>
  <p class="plan-hint">Vyplněno {sections} z {PLAN_SECTION_COUNT} částí. Ukládá se automaticky jen v tomto telefonu.</p>
</div>

<div class="plan-view no-print" hidden={mode !== 'view'}>
  {#if sections === 0}
    <p class="card">Plán je zatím prázdný. Vyplň ho v režimu Upravit.</p>
  {/if}

  {#if hasText(plan.primaryPlace, plan.backupPlace)}
    <section class="card">
      <h2 class="card-label">Místa srazu</h2>
      {#if plan.primaryPlace.trim()}
        <p class="plan-place">{plan.primaryPlace}</p>
      {/if}
      {#if plan.backupPlace.trim()}
        <p class="card-note">Záložní místo</p>
        <p class="plan-text">{plan.backupPlace}</p>
      {/if}
    </section>
  {/if}

  {#if plan.timeRules.trim()}
    <section class="card">
      <h2 class="card-label">Když nefunguje signál</h2>
      <p class="plan-text">{plan.timeRules}</p>
    </section>
  {/if}

  {#if contacts.length}
    <section class="card">
      <h2 class="card-label">Kontakty</h2>
      <ul class="plan-list">
        {#each contacts as contact}
          <li class="plan-contact">
            <span class="plan-contact-text">
              <strong>{contact.name}</strong>
              {#if contact.note.trim()}<small>{contact.note}</small>{/if}
            </span>
            {#if contact.phone.trim()}
              <a class="button" href={phoneHref(contact.phone)}>{contact.phone}</a>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if pickups.length}
    <section class="card">
      <h2 class="card-label">Vyzvedávání</h2>
      <ul class="plan-list">
        {#each pickups as pickup}
          <li><strong>{pickup.person}</strong>: vyzvedává {pickup.pickedUpBy}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if hasText(plan.routeCar, plan.routeFoot)}
    <section class="card">
      <h2 class="card-label">Trasy</h2>
      {#if plan.routeCar.trim()}
        <p class="card-note">Autem</p>
        <p class="plan-text">{plan.routeCar}</p>
      {/if}
      {#if plan.routeFoot.trim()}
        <p class="card-note">Pěšky</p>
        <p class="plan-text">{plan.routeFoot}</p>
      {/if}
    </section>
  {/if}

  {#if hasText(plan.keyLocation, plan.suppliesLocation)}
    <section class="card">
      <h2 class="card-label">Klíč a zásoby</h2>
      {#if plan.keyLocation.trim()}
        <p class="card-note">Klíč</p>
        <p class="plan-text">{plan.keyLocation}</p>
      {/if}
      {#if plan.suppliesLocation.trim()}
        <p class="card-note">Zásoby</p>
        <p class="plan-text">{plan.suppliesLocation}</p>
      {/if}
    </section>
  {/if}
</div>

<form class="plan-form" autocomplete="off" hidden={mode !== 'edit'} oninput={save} onsubmit={(event) => event.preventDefault()}>
  <fieldset>
    <legend>Kontakty</legend>
    {#each plan.contacts as contact, index}
      <div class="plan-row">
        <label>Jméno <input name="contactName" bind:value={contact.name} /></label>
        <label>Telefon <input name="contactPhone" type="tel" bind:value={contact.phone} /></label>
        <label>Poznámka <input name="contactNote" bind:value={contact.note} /></label>
        <button type="button" class="button button-quiet" onclick={() => removeContact(index)}>Odebrat kontakt</button>
      </div>
    {/each}
    <button type="button" class="button" onclick={addContact}>Přidat kontakt</button>
  </fieldset>

  <fieldset>
    <legend>Místa srazu</legend>
    <label>Primární místo srazu <input name="primaryPlace" bind:value={plan.primaryPlace} /></label>
    <label>Záložní místo srazu <input name="backupPlace" bind:value={plan.backupPlace} /></label>
  </fieldset>

  <fieldset>
    <legend>Trasy</legend>
    <label>Trasa autem <textarea name="routeCar" rows="3" bind:value={plan.routeCar}></textarea></label>
    <label>Trasa pěšky <textarea name="routeFoot" rows="3" bind:value={plan.routeFoot}></textarea></label>
  </fieldset>

  <fieldset>
    <legend>Časová pravidla</legend>
    <label>
      Co uděláme, když nefunguje signál
      <textarea name="timeRules" rows="3" placeholder="Když nefunguje signál, jedeme na místo X do času Y." bind:value={plan.timeRules}></textarea>
    </label>
  </fieldset>

  <fieldset>
    <legend>Vyzvedávání dětí a starších</legend>
    {#each plan.pickups as pickup, index}
      <div class="plan-row">
        <label>Koho <input name="pickupPerson" bind:value={pickup.person} /></label>
        <label>Kdo vyzvedává <input name="pickupBy" bind:value={pickup.pickedUpBy} /></label>
        <button type="button" class="button button-quiet" onclick={() => removePickup(index)}>Odebrat osobu</button>
      </div>
    {/each}
    <button type="button" class="button" onclick={addPickup}>Přidat osobu</button>
  </fieldset>

  <fieldset>
    <legend>Klíč a zásoby</legend>
    <label>Kde je klíč <input name="keyLocation" bind:value={plan.keyLocation} /></label>
    <label>Kde jsou zásoby <input name="suppliesLocation" bind:value={plan.suppliesLocation} /></label>
  </fieldset>
</form>

<button type="button" class="button button-primary plan-print-button no-print" onclick={() => window.print()}>Vytisknout plán</button>

<FamilyPlanPrint {plan} />
