<template>
  <div>
    <div class="orb-wrapper" @click.prevent>
      <span style="position: absolute; color: #fff; top: -23px; width: 100%; text-align: center"
        >{{ currentHealth }} / {{ maxHealth }}</span
      >
      <div class="orb-container">
        <div class="orb" :style="{ height: healthPercent + '%' }"></div>
        <div class="orb-gloss"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/usePlayerStore';

const playerStore = usePlayerStore();
// Computed property for current health
const currentHealth = computed(() => playerStore.health.currentHealth);

// Computed property for max health
const maxHealth = computed(() => playerStore.health.maxHealth);

// Computed property for health percent
const healthPercent = computed(() => {
    return (currentHealth.value / maxHealth.value) * 100;
});
</script>

<style scoped>
.orb-wrapper {
  width: 142px;
  height: 142px;
  border: 1px solid black;
  border-radius: 50%;
  position: absolute;
  bottom: 3px;
  left: 40px;
  background: rgb(0 0 0 / 65%);
  box-shadow: inset 0px 0px 12px #3f3f3f, 0px 0px 2px #121212, inset 0px 0px 2px #515151;
}

.orb-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
}

.orb {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: radial-gradient(circle at 100% 27%, #d90101, #3c0404);
  box-shadow: inset 0px 0px 58px #000, 0px 0px 2px black, inset 0px 0px 2px black;
}

.orb-gloss {
  box-shadow: 82px 0 29px 9px #fff;
  width: 1px;
  height: 1px;
  position: absolute;
  left: 0;
  opacity: 1;
  top: 42px;
  z-index: 4;
}
</style>
