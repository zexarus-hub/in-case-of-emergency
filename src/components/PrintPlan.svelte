<script lang="ts">
  import { onMount } from 'svelte';
  import { emptyFamilyPlan, loadFamilyPlan } from '../lib/familyPlan';
  import FamilyPlanPrint from './FamilyPlanPrint.svelte';

  let plan = $state(emptyFamilyPlan());

  // Skutečná data se načtou až v prohlížeči. Na serveru se vykreslí prázdná šablona.
  onMount(() => {
    plan = loadFamilyPlan();
  });
</script>

<FamilyPlanPrint {plan} />
