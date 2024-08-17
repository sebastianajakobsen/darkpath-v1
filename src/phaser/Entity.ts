import type { BaseScene } from '@/phaser/scenes/BaseScene';

export class Entity extends Phaser.Physics.Arcade.Image {
    public scene: BaseScene;
    protected prevX: number;
    protected prevY: number;
    protected id: string;
    public isActor: boolean;
    public hasPhysics: boolean;

    constructor(scene: BaseScene, x: number, y: number, texture: string, isActor = false, hasPhysics = true) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.isActor = isActor;
        this.hasPhysics = hasPhysics;
        this.id = Phaser.Math.RND.uuid(); // Assign a unique ID to each entity

        this.scene.add.existing(this);

        if (this.hasPhysics) {
            this.scene.physics.add.existing(this);
        }

        this.prevX = x;
        this.prevY = y;

        this.setOrigin(0.5, 0.5);
        this.setDepth(1);

        this.activate(x, y);
    }

    public deactivate(): void {
        if (this.hasPhysics) {
            this.setVelocity(0, 0); // Stop any movement
            this.disableBody(true, true); // Disable the physics body
        } else {
            this.setVisible(false); // Hide the entity
            this.setActive(false); // Deactivate the entity
        }
    }

    public activate(x: number, y: number): void {
        this.setAlpha(1); // Ensure the entity is fully visible
        this.setTint(0xffffff); // Reset any tint applied

        if (this.hasPhysics) {
            this.enableBody(true, x, y, true, true); // Enable the physics body and reset its position
        } else {
            this.setPosition(x, y); // Set the position for non-physics entities
            this.setVisible(true); // Show the entity
            this.setActive(true); // Activate the entity
        }
    }

    public hasMoved(): boolean {
        const moved = this.x !== this.prevX || this.y !== this.prevY;
        if (moved) {
            this.prevX = this.x;
            this.prevY = this.y;
        }
        return moved;
    }

    public update(): void {
        // Override this method in subclasses to add update logic
    }

    public destroy(fromScene?: boolean): void {
        if (this.body) {
            this.scene.physics.world.remove(this.body); // Remove the physics body from the world
        }
        super.destroy(fromScene);
    }
}
