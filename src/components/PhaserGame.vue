<template>
  <div id="game_canvas" class="game-container" />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';

import config from '@/phaser/config';

export default defineComponent({
  name: 'PhaserGame',
  setup() {
    let game = null;

    onMounted(() => {
      console.log('Mounting PhaserGame and creating new game instance.');
      game = new Phaser.Game(config);
    });

    onUnmounted(() => {
      console.log('Unmounting PhaserGame and destroying game instance.');
      if (game) {
        game.destroy(true);
      }
    });
  }
});
</script>
