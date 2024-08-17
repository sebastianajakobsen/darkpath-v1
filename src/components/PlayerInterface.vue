<template>
  <div id="player__interface">
    <ItemTooltip v-if="tooltipItem" :tooltipPosition="tooltipPosition" :item="tooltipItem" />
    <PlayerLoadout @toggle-tooltip="onToggleTooltip" />
    <HealthBar/>
    <ActionBar />
    <ManaBar/>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

import PlayerLoadout from '@/components/player/PlayerLoadout.vue';
import ItemTooltip from '@/components/items/ItemTooltip.vue';

import ActionBar from '@/components/player/ActionBar.vue';
import HealthBar from '@/components/player/HealthBar.vue';
import ManaBar from '@/components/player/ManaBar.vue';


export default {
    name: 'PlayerInterface',
    components: { ManaBar, HealthBar, ActionBar, ItemTooltip, PlayerLoadout },

    setup() {
        const tooltipItem = ref(null);
        const tooltipPosition = ref();

        const onToggleTooltip = (value) => {
            tooltipPosition.value = value.position;
            tooltipItem.value = value.item;
        };

        return {
            onToggleTooltip,
            tooltipItem,
            tooltipPosition,
        };
    },
};
</script>

<style></style>
