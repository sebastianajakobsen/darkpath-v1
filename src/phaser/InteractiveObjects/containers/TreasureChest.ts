
import { ObjectTextBox } from '@/phaser/InteractiveObjects/textboxes/ObjectTextBox';
import type { BaseScene } from '@/phaser/scenes/BaseScene';

export class TreasureChest extends Phaser.GameObjects.Sprite {
    private isOpen: boolean;
    public textBoxInstance: ObjectTextBox;
    scene: BaseScene;

    constructor(scene: BaseScene, x: number, y: number) {
        super(scene, x, y, 'woodenChestClosed');
        this.scene = scene;
        this.isOpen = false;

        // Load the sprite texture to get its height
        const chestSpriteHeight = this.displayHeight; // Get the sprite's height

        // Adjust the y position for the text box to appear above the chest
        // You may need to adjust the subtraction value to get the text box closer or further from the chest
        const textBoxY = Math.floor(y - chestSpriteHeight / 2 - 10); // Example adjustment

        this.textBoxInstance = new ObjectTextBox(scene, x, textBoxY, 'wooden chest');

        this.scene.events.on('ItemTextBoxDestroyed', (textBox: ObjectTextBox) => {
            if (textBox === this.textBoxInstance) {
                this.openChest();
                this.textBoxInstance.destroy();
            }
        });

        this.depth = this.y + this.height / 2;

        this.scene.add.existing(this);

        // TODO NEED TO HIDE IMAGE WHEN TEXTBOX IS HIDDEN???

    }

    openChest() {
        if (!this.isOpen) {
            this.isOpen = true;

            // const items = dropItemBasedOnLevel(1, true);
            // if (items) {
            //     items.forEach((item) => {
            //         // Ensures that the target's scene is a BaseScene and the attacker is a Player before creating the item drop
            //         new dropItem(this.scene, this.x, this.y, item);
            //     });
            // }

            this.setTexture('woodenChestOpen'); // Change the texture to the open chest
            // Trigger any events, like revealing the contents, playing a sound, etc.
        }
    }
}
