<template>
  <div class="gold-display">
    <img src="/assets/items/currency/gold.png" alt="Gold" class="gold-icon" />
    <span class="gold-amount">{{ gold }}</span>
  </div>
</template>
<script lang="ts">

import { useInventoryStore } from '@/stores/useInventoryStore';
import { computed } from 'vue';

export default {
    name: 'PlayerGold',
    setup() {
        const inventoryStore = useInventoryStore();

        const gold = computed(() => inventoryStore.gold);

        return { gold };
    },
};

</script>

<style scoped lang="scss">
.game-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gold-display {
  display: flex;
  align-items: center;
  font-size: 1.5em;
  margin-left: 26px;
  margin-right: 26px;
  background-color: #030303;
  padding: 3px;
  box-shadow: -1px -1px 1px rgba(10, 0, 5, 0.5), -1px 1px 1px rgba(10, 0, 5, 0.5), 1px 1px 1px rgba(10, 0, 5, 0.5), 1px -1px 1px rgba(10, 0, 5, 0.5);
  border-style: solid;
  border-width: 3px;
  border-image: url(/assets/ui/box-border.png) 5 repeat;
}

.gold-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  margin-left: 5px;
  margin-top: -2px;
}

.gold-amount {
  color: #f1c40f;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
  font-size: 16px;
}
</style>