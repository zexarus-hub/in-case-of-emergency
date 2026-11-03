<script lang="ts">
  import { onMount } from 'svelte';
  import { emptyContact, emptyPickup, usedRows, type Contact, type FamilyPlan, type Pickup } from '../lib/familyPlan';

  // Na papíře zůstanou volné řádky, aby šlo plán doplnit tužkou.
  const PRINT_CONTACT_ROWS = 6;
  const PRINT_PICKUP_ROWS = 4;

  let { plan }: { plan: FamilyPlan } = $props();
  let printedOn = $state('');

  function filled<T extends Contact | Pickup>(rows: T[], minRows: number, empty: () => T): T[] {
    const used = usedRows(rows);
    return [...used, ...Array.from({ length: Math.max(0, minRows - used.length) }, empty)];
  }

  const printContacts = $derived(filled(plan.contacts, PRINT_CONTACT_ROWS, emptyContact));
  const printPickups = $derived(filled(plan.pickups, PRINT_PICKUP_ROWS, emptyPickup));

  onMount(() => {
    printedOn = new Date().toLocaleDateString('cs-CZ');
  });
</script>

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
