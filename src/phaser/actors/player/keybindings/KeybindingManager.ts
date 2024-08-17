import Phaser from 'phaser';
import type { BaseScene } from '@/phaser/scenes/BaseScene';

export const INPUT_ACTION_KEYS = ['ACTION_1', 'ACTION_2', 'ACTION_3', 'ACTION_4', 'ACTION_5'];

export interface KeyBindings {
  // GENERAL
  TOGGLE_TEXTBOXES: Phaser.Input.Keyboard.Key;
  TOGGLE_INVENTORY: Phaser.Input.Keyboard.Key;
  ESCAPE: Phaser.Input.Keyboard.Key;
  // MOVEMENT
  MOVE_UP: Phaser.Input.Keyboard.Key;
  MOVE_LEFT: Phaser.Input.Keyboard.Key;
  MOVE_DOWN: Phaser.Input.Keyboard.Key;
  MOVE_RIGHT: Phaser.Input.Keyboard.Key;
  // ACTIONS KEYS -> ATTACKS / SPELLS
  ACTION_1: Phaser.Input.Keyboard.Key;
  ACTION_2: Phaser.Input.Keyboard.Key;
  ACTION_3: Phaser.Input.Keyboard.Key;
  ACTION_4: Phaser.Input.Keyboard.Key;
  ACTION_5: Phaser.Input.Keyboard.Key;
}

export class KeybindingManager {
    private scene: BaseScene;
    private readonly bindings: KeyBindings;

    constructor(scene: BaseScene) {
        this.scene = scene;
        if (!this.scene.input.keyboard) {
            throw new Error('Keyboard input is not available');
        }
        this.bindings = {
            TOGGLE_TEXTBOXES: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT),
            TOGGLE_INVENTORY: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            MOVE_UP: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            MOVE_LEFT: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            MOVE_DOWN: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            MOVE_RIGHT: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            ESCAPE: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),

            ACTION_1: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            ACTION_2: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            ACTION_3: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            ACTION_4: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
            ACTION_5: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
        };
    }

    getKeys(): KeyBindings {
        return this.bindings;
    }

    changeBinding(action: keyof KeyBindings, newKey: Phaser.Input.Keyboard.Key) {
        const newBinding = this.scene.input.keyboard?.addKey(newKey);
        if (newBinding) {
            this.bindings[action] = newBinding;
        } else {
            throw new Error(`Could not bind key: ${newKey}`);
        }
    }
}
