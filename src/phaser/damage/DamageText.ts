import type { BaseScene } from '@/phaser/scenes/BaseScene';

export class DamageText extends Phaser.GameObjects.BitmapText {
    constructor(scene: BaseScene, x: number, y: number, text: string) {
        super(scene, x, y, 'CinzelBold32', text);
        this.setVisible(false);
        this.setActive(false);
    }

    popUpAndFade() {
        const startY = this.y - 50;
        this.scene.tweens.add({
            targets: this,
            y: { from: startY, to: this.y - 100 },
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.setActive(false);
                this.setVisible(false);
            },
        });
    }
}
