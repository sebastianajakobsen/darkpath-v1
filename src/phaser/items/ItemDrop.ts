import type { IItem } from '@/phaser/items/IItem';
import { ItemTextBox } from '@/phaser/InteractiveObjects/textboxes/ItemTextBox';
import type { BaseScene } from '@/phaser/scenes/BaseScene';

export class ItemDrop extends Phaser.GameObjects.Sprite {
    private readonly itemData: IItem<any>;
    public textBoxInstance: ItemTextBox;
    scene: BaseScene;

    constructor(scene: BaseScene, x: number, y: number, itemData: IItem<any>) {
        super(scene, x, y, itemData.icons.ground);
        this.scene = scene;
        this.itemData = itemData;
        scene.add.existing(this);
        this.depth = this.y + this.height / 2;

        // console.log(itemData);
        // refactor to object text box! should handle textboxes for items and other objects!
        // this.textBoxInstance = new ItemTextBox(scene, x, y, itemData);
        this.textBoxInstance = new ItemTextBox(scene, x, y, itemData);

        this.scene.events.on('ItemTextBoxDestroyed', (textBox: ItemTextBox) => {
            if (textBox === this.textBoxInstance) {
                this.destroy();
            }
        });
    }

    public destroy(): void {
        super.destroy();
    }
}
