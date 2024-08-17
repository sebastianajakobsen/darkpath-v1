import { Actor } from '@/phaser/actors/Actor';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { KeybindingHandler } from '@/phaser/actors/player/keybindings/KeybindingHandler';
import Phaser from 'phaser';
import { ActionManager } from '@/phaser/actors/player/actions/ActionManager';
import { ActorType } from '@/phaser/actors/IActor';
import { watch } from 'vue';
import { ItemDrop } from '@/phaser/items/ItemDrop';
import type { BaseTextBox } from '@/phaser/InteractiveObjects/textboxes/BaseTextBox';
import { ITEM_PICKUP_DISTANCE } from '@/phaser/const/Item';
import { PLAYER_MOVE_THRESHOLD } from '@/phaser/const/Movement';
import { CooldownManager } from '@/phaser/actors/player/actions/CooldownManager';


export class Player extends Actor {
    cursorTarget = new Phaser.Math.Vector2(0, 0);
    keybindingHandler!: KeybindingHandler;
    // Debug cursor target sprite
    // debugCursorTarget!: Phaser.GameObjects.Image;
    targetOffset = new Phaser.Math.Vector2(0, 0);
    actionManager!: ActionManager;
    tempDirection = new Phaser.Math.Vector2();
    stopWatchFn: (()=> void) | null = null; // add this line

    debugGraphics!: Phaser.GameObjects.Graphics;

    currentTextBoxInteraction!: BaseTextBox | null;

    textBoxInteractionActive = 0;
    textBoxInteractionInProgress = false;
    movementCooldownTimer = 0; // Counter to manage the delay

    cooldownManager = new CooldownManager();

    lastInvocationTime: number = 0;
    fireRateInterval: number = 50; // milliseconds

    private keyActionMap: Record<string, ()=> void> = {
        mouseButtonRightDown: () => this.performAction('attackMR'),
        action1KeyDown: () => this.performAction('attack1'),
        action2KeyDown: () => this.performAction('attack2'),
        action3KeyDown: () => this.performAction('attack3'),
        action4KeyDown: () => this.performAction('attack4'),
        action5KeyDown: () => this.performAction('attack5'),
    };

    constructor(scene: BaseScene, x: number, y: number, texture: string) {
        super(scene, x, y, texture, ActorType.Player);

        if(scene.physics.world.drawDebug) {
            this.debugGraphics = scene.add.graphics();
        }

        this.initInventoryWatcher();

        this.scene.events.on('resume', () => {
            this.initInventoryWatcher(); // Restart the watcher
        });
        this.scene.events.on('pause', () => {
            this.stopWatcher();
        });

        this.actionManager = new ActionManager(this);
        this.keybindingHandler = new KeybindingHandler(this.scene);
        this.keybindingHandler.on('left_pointer_down', (event: Phaser.Input.Pointer) => this.onLeftPointerDown(event));
        this.scene.events.on('textbox_interaction', (event, data) => {
            this.textBoxInteractionInProgress = true;
            this.currentTextBoxInteraction = data; // Store the entire interaction data
            this.textBoxInteractionActive = 1;

            this.cursorTarget.set(data.objectX, data.objectY);

            // Check if we are close enough to the textbox to interact with it
            if(this.checkForTextBoxInteraction()) {
                return;
            }

            this.movementManager.moveToTarget(this.cursorTarget);
        });

        setTimeout(() => {
            this.takeDamage(8000);
        }, 2000);

        // this.debugCursorTarget = this.scene.add.image(0, 0, 'cursor').setVisible(false).setDepth(1);
    }

    private stopWatcher() {
        if (this.stopWatchFn) {
            this.stopWatchFn(); // Call the stop function
            this.stopWatchFn = null;
        }
    }

    private initInventoryWatcher() {
        this.stopWatchFn = watch(
            () => this.scene.inventoryStore.itemDrop,
            (newVal, oldVal) => {
                if (newVal !== oldVal && newVal !== null) {
                    new ItemDrop(this.scene, this.x, this.y, newVal);
                }
            },
        );
    }

    isAlive() {
        return this.health.currentHealth > 0;
    }

    onLeftPointerDown() {
        // Check if we are interacting with a textbox
        // If we are, we should not move the player
        // but next time we click we should remove the textbox interaction
        if(this.textBoxInteractionActive) {
            this.textBoxInteractionActive = 0;
            return;
        }

        this.textBoxInteractionInProgress = false;
        this.currentTextBoxInteraction = null;
    }


    private performAction(actionKey = 'attackMR') {
        const now = this.scene.time.now;

        if (now - this.lastInvocationTime >= this.fireRateInterval) {
            this.textBoxInteractionInProgress = false;
            this.currentTextBoxInteraction = null;
            this.textBoxInteractionActive = 0;

            // Dynamically access the attack function based on attackFunc argument
            const attackFunction = this.actionManager.attacks[actionKey];

            if (typeof attackFunction !== 'function') {
                console.error('Invalid attack key provided: ' + actionKey);
                return;
            }

            this.updateCursorTarget();

            this.tempDirection.set(this.cursorTarget.x - this.x, this.cursorTarget.y - this.y).normalize();

            attackFunction(this.tempDirection);
            this.lastInvocationTime = now;
        }
    }


    private updateTargetPosition() {

        if(this.textBoxInteractionActive) {
            this.textBoxInteractionActive = 0;
            return;
        }

        this.textBoxInteractionInProgress = false;
        this.currentTextBoxInteraction = null;


        if(this.movementCooldownTimer > 0) return;

        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

        this.updateCursorTarget();
        // Directly calculate squared distance without creating a new vector
        const dx = this.x - worldPoint.x;
        const dy = this.y - worldPoint.y;
        const distanceSquared = dx * dx + dy * dy;

        // Update the target position if the squared distance is greater than the squared threshold
        if (distanceSquared > PLAYER_MOVE_THRESHOLD) {
            // Directly use worldPoint to update the target position, avoiding unnecessary Vector2 creation
            this.movementManager.moveToTarget(this.cursorTarget);
        }
    }

    updateCursorTarget() {
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.cursorTarget.set(worldPoint.x, worldPoint.y);
        // this.debugCursorTarget.setPosition(worldPoint.x, worldPoint.y).setVisible(true);
    }

    private updateDebugGraphics() {

        if (this.debugGraphics) {
            this.debugGraphics.clear();
            this.debugGraphics.setDepth(1111);

            // draw the player's movement radius
            this.debugGraphics.lineStyle(2, 0x00ff00);
            this.debugGraphics.strokeCircle(this.x, this.y, Math.sqrt(PLAYER_MOVE_THRESHOLD)); // Radius is the square root of distanceSquared

            // draw the item pickup distance
            this.debugGraphics.lineStyle(2, 0x90EE90);
            this.debugGraphics.strokeCircle(this.x, this.y, Math.sqrt(ITEM_PICKUP_DISTANCE)); // Radius is the square root of distanceSquared
        }
    }

    private checkForTextBoxInteraction() {
        if(this.currentTextBoxInteraction) {
            // check if we are close enough to the textbox to interact with it
            const dx = this.x - this.currentTextBoxInteraction.objectX;
            const dy = this.y - this.currentTextBoxInteraction.objectY;
            const distanceSquared = dx * dx + dy * dy;

            if(distanceSquared < ITEM_PICKUP_DISTANCE) {
                this.currentTextBoxInteraction.handleInteraction();
                this.currentTextBoxInteraction = null;
                this.textBoxInteractionActive = 0;
                this.movementCooldownTimer = 150;
                this.movementManager.stopMovement();
                return true;
            }
            return false;
        }

        return false;
    }

    private checkForMovementDisable() {
        if (this.movementCooldownTimer > 0) {
            this.movementCooldownTimer -= this.scene.game.loop.delta;
            if (this.movementCooldownTimer <= 0) {
                this.textBoxInteractionInProgress = false;
            }
        }
    }

    update() {
        super.update();

        this.updateDebugGraphics();

        this.checkForMovementDisable();
        this.checkForTextBoxInteraction();

        this.actionManager.update();

        // Iterate over the keyActionMap to check key states and trigger actions
        Object.entries(this.keyActionMap).forEach(([key, action]) => {
            if (this.keybindingHandler[key]) {
                // console.log(`${key} triggered`);
                action();
                return;  // Return after the first action to avoid multiple actions per frame
            }
        });

        // we only want to move if leftButton is down and we are not interacting with a textbox
        if(this.keybindingHandler.mouseButtonLeftDown && !this.textBoxInteractionInProgress) {
            this.updateTargetPosition();
        }
    }
}