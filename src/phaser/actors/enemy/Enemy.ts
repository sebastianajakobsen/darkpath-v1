
import Phaser from 'phaser';

import { Actor } from '@/phaser/actors/Actor';
import { ActorType } from '@/phaser/actors/IActor';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { ENEMY_STOP_THRESHOLD } from '@/phaser/const/Movement';
export class Enemy extends Actor {
    public target!: Actor;
    private targetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private visibilityDistanceSquared = 800 * 800; // Minimum squared distance threshold
    private aggroDistanceSquare = 400 * 400; // Squared distance threshold for chasing
    private debugGraphics!: Phaser.GameObjects.Graphics;

    constructor(scene: BaseScene, x: number, y: number, texture: string) {
        super(scene, x, y, texture, ActorType.Enemy);
        this.setSize(35, 60);

        this.initDebugGraphics(); // Initialize debug graphics

    }

    initDebugGraphics() {
        if(this.scene.physics.world.drawDebug) {
            // Assuming the scene has a dedicated layer or container for debug graphics
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.lineStyle(1, 0xFF0000); // Red color for visibility
        }
    }

    setTarget(target: Actor) {
        this.target = target;
        this.targetPosition.set(target.x, target.y); // Initialize with player's starting position
        this.movementManager.moveToTarget(this.targetPosition);
    }

    deactivate(): void {
        this.handleDeathAnimation().then(() => {
            if (this.healthBar) {
                this.healthBar.destroy();
            }
            super.deactivate();
        });
    }

    update() {
        super.update();
        if (!this.target || !this.isAlive()) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const squaredDistance = dx * dx + dy * dy;

        // TODO: should deactive the enemy and activate them again
        // maybe have 2 enemies groups.. one active and not because they are out of range
        if (squaredDistance > this.visibilityDistanceSquared) {
            this.movementManager.stopMovement();
            this.setVisible(false);
            return;
        } else {
            this.setVisible(true);
        }


        // Draw debug circle
        if(this.debugGraphics) {
            this.debugGraphics.clear(); // Clear previous drawings
            this.debugGraphics.setDepth(1111);
            this.debugGraphics.lineStyle(2, 0xFFF000);
            this.debugGraphics.strokeCircle(this.x, this.y, Math.sqrt(this.visibilityDistanceSquared)); // Radius is the square root of minDistanceSquared

            this.debugGraphics.lineStyle(2, 0xFF0000); // Blue for chase range
            this.debugGraphics.strokeCircle(this.x, this.y, Math.sqrt(this.aggroDistanceSquare));
        }



        // Check if the target has moved and is within the minimum distance
        if (squaredDistance < this.aggroDistanceSquare && squaredDistance > ENEMY_STOP_THRESHOLD ) {
            if (this.target.x !== this.targetPosition.x || this.target.y !== this.targetPosition.y) {
                this.targetPosition.set(this.target.x, this.target.y);
                this.movementManager.moveToTarget(this.targetPosition);
            }
        } else {
            this.movementManager.stopMovement(); // Stop chasing if out of chase range
        }
    }

    destroy() {
        super.destroy();
    }
}