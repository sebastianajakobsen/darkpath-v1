import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { ITEM_MAX_VISIBLE_DISTANCE } from '@/phaser/const/Item';

export class BaseTextBox {
    protected readonly scene!: BaseScene;
    protected textObject: Phaser.GameObjects.BitmapText;
    textBox!: Phaser.GameObjects.Image;
    protected label: string;

    objectX!: number;
    objectY!: number;
    hasPosition = false;
    forceVisibility = false;
    forceVisibilityValue = false;
    constructor(
        scene: BaseScene,
        x: number,
        y: number,
        label: string,
        font = 'CinzelBlack36',
        color: number = 0xffffff,
    ) {
        this.scene = scene;
        this.label = label;

        this.objectX  = x;
        this.objectY = y;

        // TODO: maybe not use setOrigin(0.5)
        this.textObject = scene.add
            .bitmapText(x, y, font, this.label) // Use double the intended final size
            .setOrigin(0.5)
            .setTint(color)
            .setDepth(1000);

        this.createBackground(x, y, 'textbox-background'); // Updated method call

        // adjust textbox position, so it doesn't overlap with other textboxes
        this.adjustTextboxPosition();
    }

    private createBackground(x: number, y: number, key: string) {
        const padding = 12;
        this.textBox = this.scene.add
            .image(x, y, key)
            .setOrigin(0.5)
            .setDisplaySize(
                this.textObject.width + padding,
                this.textObject.height + padding,
            )
            .setDepth(999);

        this.textBox.setInteractive();
        this.textBox.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.scene.events.emit('textbox_interaction', pointer, this);
            }
        });

        // console.log(this.textBox);

        this.textBox.on('pointerover', () => this.onHoverEnter());
        this.textBox.on('pointerout', () => this.onHoverLeave());
    }

    public onHoverEnter() {
        this.updateGraphicsOnHover(true);
    // ... rest of the method
    }

    public onHoverLeave() {
        this.updateGraphicsOnHover(false);
    // ... rest of the method
    }

    private updateGraphicsOnHover(isHover: boolean): void {
        if (isHover) {
            this.textBox.setTexture('textbox-hover');
        } else {
            this.textBox.setTexture('textbox-background');
        }
    }

    private isOverlappingOrOutOfBounds = (textbox: BaseTextBox, x: number, y: number): BaseTextBox | null => {
        const width = textbox.textBox.displayWidth;
        const height = textbox.textBox.displayHeight;
        const right = x + width;
        const bottom = y + height;

        return this.scene.textBoxes
            .filter((otherTextBox: BaseTextBox) => otherTextBox !== textbox && otherTextBox.hasPosition)
            .find((otherTextBox: BaseTextBox) => {
                const otherX = otherTextBox.textBox.x - otherTextBox.textBox.displayWidth / 2;
                const otherY = otherTextBox.textBox.y - otherTextBox.textBox.displayHeight / 2;
                const otherRight = otherX + otherTextBox.textBox.displayWidth;
                const otherBottom = otherY + otherTextBox.textBox.displayHeight;

                return x < otherRight && right > otherX && y < otherBottom && bottom > otherY;
            }) || null;
    };

    // TODO: might need to fix this, but it works okayish for now
    public adjustTextboxPosition(maxRecursions = 100) {
        if (maxRecursions <= 0) return; // Prevent infinite recursion

        let attempt = 0; // Counter to control the direction and method of repositioning

        let posX = this.textBox.x - this.textBox.displayWidth / 2;
        let posY = this.textBox.y - this.textBox.displayHeight / 2;

        let overlappingTextbox = this.isOverlappingOrOutOfBounds(this, posX, posY);

        while (overlappingTextbox && attempt < maxRecursions) {

            const direction = Math.floor(Math.random() * 4); // Randomly select a direction 0-3

            switch (direction) {
            case 0: // Up
                posY = (overlappingTextbox.textBox.y - overlappingTextbox.textBox.displayHeight / 2) - this.textBox.displayHeight;
                break;
            case 1: // Down
                posY = (overlappingTextbox.textBox.y + overlappingTextbox.textBox.displayHeight / 2);
                break;
            case 2: // Right
                posX = (overlappingTextbox.textBox.x + overlappingTextbox.textBox.displayWidth / 2);
                break;
            case 3: // Left
                posX = (overlappingTextbox.textBox.x - overlappingTextbox.textBox.displayWidth / 2) - this.textBox.displayWidth;
                break;
            default:
                posY = (overlappingTextbox.textBox.y - overlappingTextbox.textBox.displayHeight / 2) - this.textBox.displayHeight;
                break;
            }

            // posY = (overlappingTextbox.textBox.y - overlappingTextbox.textBox.displayHeight / 2) - this.textBox.displayHeight; // above placement
            // posY = (overlappingTextbox.textBox.y + overlappingTextbox.textBox.displayHeight / 2); // under placement
            // posX = (overlappingTextbox.textBox.x + overlappingTextbox.textBox.displayWidth / 2); // right placement
            // posX = (overlappingTextbox.textBox.x - overlappingTextbox.textBox.displayWidth / 2) - this.textBox.displayWidth; // left placement

            overlappingTextbox = this.isOverlappingOrOutOfBounds(this, posX, posY);

            attempt++;
        }

        if (!overlappingTextbox) {
            // Set the position if a non-overlapping position is found
            this.textBox.setPosition(
                posX + this.textBox.displayWidth / 2,
                posY + this.textBox.displayHeight / 2,
            );
            this.hasPosition = true;
            this.textObject.setPosition(this.textBox.x, this.textBox.y - 2);
            // console.log('Textbox position adjusted', attempt);
        } else {
            // Optional: Handle the case where no valid position is found after all attempts
            console.error('Failed to position textbox without overlap after maximum attempts.');
            // just place it on top of the other textbox
            this.textBox.setPosition(
                overlappingTextbox.textBox.x,
                overlappingTextbox.textBox.y,
            );
            this.hasPosition = true;
            this.textObject.setPosition(this.textBox.x, this.textBox.y - 2);
        }
    }



    setForceVisibility(isVisible: boolean) {
        this.forceVisibility = !this.forceVisibility;
        this.forceVisibilityValue = isVisible;

        const dx = this.scene.player.x - this.objectX;
        const dy = this.scene.player.y - this.objectY;
        const distanceSquared = dx * dx + dy * dy;

        const shouldBeVisible = distanceSquared <= ITEM_MAX_VISIBLE_DISTANCE;

        if(shouldBeVisible && isVisible) {
            this.setVisible(isVisible);
        } else {
            this.setVisible(false);
        }
    }


    // TODO maybe hide the object over the textbox also?
    setVisible(isVisible: boolean): void {

        let isVisibleValue = isVisible;

        if(this.forceVisibility) {
            isVisibleValue = this.forceVisibilityValue;
        }

        this.textBox.setVisible(isVisibleValue);
        this.textObject.setVisible(isVisibleValue);

        if (isVisibleValue) {
            this.textBox.setInteractive();
        } else {
            this.textBox.removeInteractive();
        }
    }

    // we override this in the child class
    // specific textbox action
    protected performInteraction() {
    // Default behavior or nothing
    }

    public handleInteraction() {
        // console.log('here?');
        this.performInteraction();
    }

    // Shared methods like updateContent, setVisible, etc.
    // ...
    destroy() {
        this.textObject.destroy();
        this.textBox.destroy();
        // remove textbox from global textboxes
        const index = this.scene.textBoxes.indexOf(this);
        if (index !== -1) {
            this.scene.textBoxes.splice(index, 1);
        }
        const visibleIndex = this.scene.textBoxes.indexOf(this);
        if (visibleIndex !== -1) {
            this.scene.textBoxes.splice(visibleIndex, 1);
        }
    }
}
