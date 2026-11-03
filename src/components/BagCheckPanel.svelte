<script lang="ts">
  import { onMount } from 'svelte';
  import { RESTORED_EVENT } from '../lib/backup';
  import { daysSince, formatCheckAge, formatCheckDate, loadBagCheck, saveBagCheck, type BagCheck } from '../lib/bagCheck';

  let check = $state<BagCheck | null>(null);
  let saveFailed = $state(false);

  function markChecked() {
    const saved = saveBagCheck();
    saveFailed = saved === null;
    if (saved) check = saved;
  }

  onMount(() => {
    const reload = () => {
      check = loadBagCheck();
    };
    reload();
    window.addEventListener(RESTORED_EVENT, reload);
    return () => window.removeEventListener(RESTORED_EVENT, reload);
  });
</script>

<section class="bag-check">
  <h2>Poslední kontrola</h2>
  {#if check}
    <p class="bag-check-date">{formatCheckDate(check.lastChecked)} ({formatCheckAge(daysSince(check.lastChecked))})</p>
  {:else}
    <p class="bag-check-date">Zatím bez kontroly</p>
  {/if}
  <p>Při kontrole projdi trvanlivost jídla, vody a léků. Zkontroluj baterie a nabij powerbanku.</p>
  {#if saveFailed}
    <p class="notice" role="alert">Datum se nepodařilo uložit.</p>
  {/if}
  <button type="button" class="button button-primary" onclick={markChecked}>Zkontrolováno dnes</button>
</section>
