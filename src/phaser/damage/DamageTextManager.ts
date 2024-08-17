import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { DamageText } from '@/phaser/damage/DamageText';

export class DamageTextManager {
    private damageTextGroup: Phaser.GameObjects.Group;

    constructor(scene: BaseScene) {
        this.damageTextGroup = scene.add.group({
            classType: DamageText,
            runChildUpdate: false,
        });
    }

    showDamageText(x: number, y: number, text: string, isCrit: boolean = false) {
        const damageText = this.damageTextGroup.get() as DamageText;

        if (!damageText) {
            console.warn('Failed to get a damage text object from the group.');
            return;
        }

        if (!isCrit) {
            damageText.setScale(0.5);
            damageText.setDepth(7777776);
            damageText.setTint(0xffffff); // White for normal hits
        } else {
            damageText.setScale(1);
            damageText.setDepth(7777777);
            damageText.setTint(0xffff00); // Yellow for critical hits
        }

        damageText.setActive(true);
        damageText.setText(text);
        damageText.setPosition(x, y);
        damageText.setOrigin(0.5);
        damageText.setVisible(true);

        damageText.popUpAndFade();
    }
}
