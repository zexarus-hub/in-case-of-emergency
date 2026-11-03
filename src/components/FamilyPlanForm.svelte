<script lang="ts">
  import { onMount } from 'svelte';
  import { RESTORED_EVENT } from '../lib/backup';
  import {
    emptyContact,
    emptyFamilyPlan,
    emptyPickup,
    loadFamilyPlan,
    saveFamilyPlan,
    type Contact,
    type Pickup,
  } from '../lib/familyPlan';

  // Na papíře zůstanou volné řádky, aby šlo plán doplnit tužkou.
  const PRINT_CONTACT_ROWS = 6;
  const PRINT_PICKUP_ROWS = 4;

  let plan = $state(emptyFamilyPlan());
  let saveFailed = $state(false);
  let printedOn = $state('');

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

  function filled<T extends Contact | Pickup>(rows: T[], minRows: number, empty: () => T): T[] {
    const used = rows.filter((row) => Object.values(row).some((value) => value.trim() !== ''));
    return [...used, ...Array.from({ length: Math.max(0, minRows - used.length) }, empty)];
  }

  const printContacts = $derived(filled(plan.contacts, PRINT_CONTACT_ROWS, emptyContact));
  const printPickups = $derived(filled(plan.pickups, PRINT_PICKUP_ROWS, emptyPickup));

  // Načítá se až v prohlížeči. Na serveru se vykreslí prázdná šablona.
  onMount(() => {
    const reload = () => {
      plan = loadFamilyPlan();
    };
    reload();
    printedOn = new Date().toLocaleDateString('cs-CZ');
    window.addEventListener(RESTORED_EVENT, reload);
    return () => window.removeEventListener(RESTORED_EVENT, reload);
  });
</script>

{#if saveFailed}
  <p class="notice no-print" role="alert">Změnu se nepodařilo uložit. Po zavření aplikace se ztratí. Plán si vytiskni nebo opiš.</p>
{/if}

<form class="plan-form" autocomplete="off" oninput={save} onsubmit={(event) => event.preventDefault()}>
  <p class="plan-hint">Vše se ukládá automaticky jen v tomto telefonu.</p>

  <fieldset>
    <legend>Kontakty</legend>
    {#each plan.contacts as contact, index}
      <div class="plan-row">
        <label>Jméno <input name="contactName" bind:value={contact.name} /></label>
        <label>Telefon <input name="contactPhone" type="tel" bind:value={contact.phone} /></label>
        <label>Poznámka <input name="contactNote" bind:value={contact.note} /></label>
        <button type="button" class="button" onclick={() => removeContact(index)}>Odebrat kontakt</button>
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
        <button type="button" class="button" onclick={() => removePickup(index)}>Odebrat osobu</button>
      </div>
    {/each}
    <button type="button" class="button" onclick={addPickup}>Přidat osobu</button>
  </fieldset>

  <fieldset>
    <legend>Klíč a zásoby</legend>
    <label>Kde je klíč <input name="keyLocation" bind:value={plan.keyLocation} /></label>
    <label>Kde jsou zásoby <input name="suppliesLocation" bind:value={plan.suppliesLocation} /></label>
  </fieldset>

  <button type="button" class="button button-primary plan-print-button" onclick={() => window.print()}>Vytisknout plán</button>
</form>

<div class="plan-print">
  {#if printedOn}
    <p>Vytištěno: {printedOn}</p>
  {/if}

  <h2>Kontakty</h2>
  <table>
    <thead>
      <tr><th>Jméno</th><th>Telefon</th><th>Poznámka</th></tr>
    </thead>
    <tbody>
      {#each printContacts as contact}
        <tr><td>{contact.name}</td><td>{contact.phone}</td><td>{contact.note}</td></tr>
      {/each}
    </tbody>
  </table>

  <h2>Místa srazu</h2>
  <h3>Primární místo srazu</h3>
  <p class="print-value">{plan.primaryPlace}</p>
  <h3>Záložní místo srazu</h3>
  <p class="print-value">{plan.backupPlace}</p>

  <h2>Trasy</h2>
  <h3>Trasa autem</h3>
  <p class="print-value print-value-tall">{plan.routeCar}</p>
  <h3>Trasa pěšky</h3>
  <p class="print-value print-value-tall">{plan.routeFoot}</p>

  <h2>Časová pravidla</h2>
  <h3>Co uděláme, když nefunguje signál</h3>
  <p class="print-value print-value-tall">{plan.timeRules}</p>

  <h2>Vyzvedávání dětí a starších</h2>
  <table>
    <thead>
      <tr><th>Koho</th><th>Kdo vyzvedává</th></tr>
    </thead>
    <tbody>
      {#each printPickups as pickup}
        <tr><td>{pickup.person}</td><td>{pickup.pickedUpBy}</td></tr>
      {/each}
    </tbody>
  </table>

  <h2>Klíč a zásoby</h2>
  <h3>Kde je klíč</h3>
  <p class="print-value">{plan.keyLocation}</p>
  <h3>Kde jsou zásoby</h3>
  <p class="print-value">{plan.suppliesLocation}</p>
</div>
