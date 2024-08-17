import { KeybindingManager, type KeyBindings } from '@/phaser/actors/player/keybindings/KeybindingManager';
import type { BaseScene } from '@/phaser/scenes/BaseScene';

enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2
}

export class KeybindingHandler extends Phaser.Events.EventEmitter {
    private keybindingManager: KeybindingManager;
    private keybindings: KeyBindings;


    mouseButtonLeftDown: boolean = false;
    mouseButtonRightDown: boolean = false;

    // TODO: add attack keys down also
    action1KeyDown: boolean = false;
    action2KeyDown: boolean = false;
    action3KeyDown: boolean = false;
    action4KeyDown: boolean = false;
    action5KeyDown: boolean = false;

    showTextBoxes = true;

    constructor(private scene: BaseScene) {
        super();
        this.keybindingManager = new KeybindingManager(scene);
        this.keybindings = this.keybindingManager.getKeys();
        this.setupMousePointerListeners();
        this.setupKeyBindingListeners();
    }

    private setupMousePointerListeners() {
        const { input } = this.scene;
        // mouse down events we only want to register inside the phaser canvas
        input.on('pointerdown', (event: Phaser.Input.Pointer) => this.handleMousePointerDown(event));
        // Add a global listener for pointer up events to handle cases where the pointer is released outside the canvas
        window.addEventListener('mouseup', (event: MouseEvent) => this.handleMousePointerUp(event));
    }

    private setupKeyBindingListeners() {
        Object.entries(this.keybindings).forEach(([action, keyCode]) => {
            const addedKey = this.scene.input.keyboard.addKey(keyCode);
            addedKey.on('down', () => {
                if(action === 'TOGGLE_INVENTORY') {
                    this.scene.inventoryStore.isOpen = !this.scene.inventoryStore.isOpen;
                }

                if(action === 'TOGGLE_TEXTBOXES') {
                    this.showTextBoxes = !this.showTextBoxes;

                    this.scene.textBoxes.forEach((textBox) => {
                        textBox.setForceVisibility(this.showTextBoxes);
                        textBox.textBox.x = textBox.objectX;
                        textBox.textBox.y = textBox.objectY;
                        textBox.hasPosition = false;
                    });

                    if(this.showTextBoxes) {
                        this.scene.textBoxes.forEach((textBox) => {
                            textBox.adjustTextboxPosition();
                        });
                    }
                }
                if (action.includes('ACTION')) {
                    this.setActionKeyDown(action, true);
                }
            });
            addedKey.on('up', () => {
                if (action.includes('ACTION')) {
                    this.setActionKeyDown(action, false);
                }
            });
        });
    }

    private setActionKeyDown(action: string, isDown: boolean) {
        const actionNumber = action.split('_')[1];
        const keyProperty = `action${actionNumber}KeyDown`;

        if (Object.prototype.hasOwnProperty.call(this, keyProperty)) {
            console.log('setting key down', keyProperty, isDown);
            (this as any)[keyProperty] = isDown; // Using `any` here to bypass type checking
        } else {
            console.warn(`No key state found for action: ${action}`);
        }
    }

    private handleMousePointerDown(pointer: Phaser.Input.Pointer) {
        if (pointer.leftButtonDown() && !this.mouseButtonLeftDown && !this.scene.inventoryStore.isDraggingItem) {
            this.mouseButtonLeftDown = true;
            this.emit('left_pointer_down');
        }
        if (pointer.rightButtonDown() && !this.mouseButtonRightDown) {
            this.mouseButtonRightDown = true;
        }
    }

    private handleMousePointerUp(event: MouseEvent) {
        switch (event.button) {
        case MouseButton.Left: // Left button
            if (this.mouseButtonLeftDown) {
                this.mouseButtonLeftDown = false;
                this.emit('left_pointer_up', event);
            }
            break;
        case MouseButton.Right: // Right button
            if (this.mouseButtonRightDown) {
                this.mouseButtonRightDown = false;
                this.emit('right_pointer_up', event);
            }
            break;
        default:
            console.log(`Unhandled mouse button: ${event.button}`);
            break;
        }
    }

    destroy() {
        const { input } = this.scene;
        input.removeListener('pointerdown');
        window.removeEventListener('pointerup', this.handleMousePointerUp);
    }
}
