<script setup lang="ts">
import PlayerInterface from '@/components/PlayerInterface.vue';
import { onMounted, onUnmounted } from 'vue';
import config from '@/phaser/config';

let game = null;

onMounted(() => {
  game = new Phaser.Game(config);
});

onUnmounted(() => {
  game.destroy(true);
});
</script>

<template>
  <PlayerInterface />
</template>

<style>
@import '/assets/css/reset.css';

body {
  font-family: 'Cinzel', serif;
}
</style>
