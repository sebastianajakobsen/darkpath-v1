import { BaseTextBox } from '@/phaser/InteractiveObjects/textboxes/BaseTextBox';
import { rarityFontSizeMap } from '@/phaser/const/Font';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { ItemRarityType } from '@/phaser/items/IItem';

export class ObjectTextBox extends BaseTextBox {
    constructor(scene: BaseScene, x: number, y: number, name: string) {
        const fontSize = rarityFontSizeMap[ItemRarityType.NORMAL];
        // const color = rarityColorMap[ItemRarityType.NORMAL];

        super(scene, x, y, name, fontSize, 0xD3D3D3);
    }

    protected performInteraction() {
        super.destroy();
        this.destroy();
        this.scene.events.emit('ItemTextBoxDestroyed', this);
    }
}
