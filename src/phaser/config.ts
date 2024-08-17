import Phaser from 'phaser';
import { Scene1 } from '@/phaser/scenes/Scene1';

const Config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game_canvas',
  disableContextMenu: true,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60, // 144 fixes issue with jitter on camera follow if high hz monitor
      debug: false,
      gravity: { y: 0, x: 0 },
      // RBush settings
      maxEntries: 16, // default is 16 - change to 32 for more dense maps
      useTree: true // RBush is a high-performance JavaScript library for 2D spatial indexing of points and rectangles
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'game__canvas'
  },
  batchSize: 4096, // default webgl batchSize
  scene: [Scene1]
};

export default Config;
