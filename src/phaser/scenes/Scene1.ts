import { BaseScene } from '@/phaser/scenes/BaseScene';

export class Scene1 extends BaseScene {
  constructor() {
    super('Scene1');
  }

  preload() {
    super.preload();
  }

  create() {
    console.log('hello world 123');
    const graphics = this.add.graphics();

    graphics.lineStyle(50, 0xffd900);
    graphics.beginPath();
    graphics.arc(400, 300, 200, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.02);
    graphics.strokePath();
    graphics.closePath();

    graphics.beginPath();
    graphics.lineStyle(40, 0xff00ff);
    graphics.arc(400, 300, 200, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), true, 0.02);
    graphics.strokePath();
    graphics.closePath();
  }

  update(time: number, delta: number) {}
}
