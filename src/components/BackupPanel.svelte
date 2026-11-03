<script lang="ts">
  import {
    backupFileName,
    createBackup,
    parseBackup,
    restoreBackup,
    MAX_BACKUP_BYTES,
    RESTORED_EVENT,
    type Backup,
  } from '../lib/backup';

  let message = $state('');
  let error = $state('');
  let pending = $state<Backup | null>(null);

  function show(text: string, isError = false) {
    message = isError ? '' : text;
    error = isError ? text : '';
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFileName();
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    show('Záloha se ukládá. Najdeš ji ve stažených souborech.');
  }

  async function chooseFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    // Aby šel stejný soubor vybrat znovu.
    input.value = '';
    pending = null;
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      show('Soubor je příliš velký. Vyber zálohu z této aplikace.', true);
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      show('Soubor nejde přečíst. Zkus to znovu.', true);
      return;
    }
    const result = parseBackup(text);
    if (result.ok) {
      pending = result.backup;
      show('');
    } else {
      show(result.error, true);
    }
  }

  function confirmRestore() {
    if (!pending) return;
    const restored = restoreBackup($state.snapshot(pending));
    pending = null;
    if (restored) {
      window.dispatchEvent(new Event(RESTORED_EVENT));
      show('Záloha je obnovená.');
    } else {
      show('Zálohu se nepodařilo obnovit. Původní data zůstala beze změny.', true);
    }
  }

  function cancelRestore() {
    pending = null;
    show('Obnovení je zrušené. Nic se nezměnilo.');
  }
</script>

<section class="backup">
  <h2>Záloha</h2>
  <p>Data jsou uložená jen v tomto telefonu. Zálohou je přeneseš do jiného telefonu.</p>
  <p>Na iPhonu přidej aplikaci na plochu. Jinak může systém data po několika dnech bez použití smazat. Po každé větší změně si ulož novou zálohu.</p>
  <p>Soubor není zašifrovaný. Posílej ho jen rodině.</p>

  <div class="backup-actions">
    <button type="button" class="button" onclick={exportBackup}>Uložit zálohu</button>
    <label class="button">
      Obnovit ze zálohy
      <input class="visually-hidden" type="file" accept=".json,application/json" onchange={chooseFile} />
    </label>
  </div>

  {#if pending}
    <div class="notice" role="alert">
      <p>Záloha z {new Date(pending.exportedAt).toLocaleString('cs-CZ')}. Přepíše data uložená v tomto telefonu.</p>
      <div class="backup-actions">
        <button type="button" class="button button-primary" onclick={confirmRestore}>Přepsat data</button>
        <button type="button" class="button" onclick={cancelRestore}>Zrušit</button>
      </div>
    </div>
  {/if}

  {#if message}
    <p class="notice" role="status">{message}</p>
  {/if}
  {#if error}
    <p class="notice" role="alert">{error}</p>
  {/if}
</section>
