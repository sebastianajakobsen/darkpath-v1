import { MAP_TILE_SIZE } from '@/phaser/const/Map';
import type { Actor } from '@/phaser/actors/Actor';
import { ActorType } from '@/phaser/actors/IActor';
import { ENEMY_STOP_THRESHOLD, PLAYER_STOP_THRESHOLD } from '@/phaser/const/Movement';


export class MovementManager {
    private pathGraphics!: Phaser.GameObjects.Graphics;
    private readonly actor: Actor;

    target = new Phaser.Math.Vector2(0, 0);
    isMovingToTarget = false;
    tolerance!: number;
    // squaredTolerance!: number;
    private currentPath: { x: number, y: number }[] = [];
    private currentPathIndex = 0;

    private threshold!: number;
    debugGraphics!: Phaser.GameObjects.Graphics;

    constructor(actor: Actor) {
        this.actor = actor;
        this.pathGraphics = this.actor.scene.add.graphics();
        this.pathGraphics.setDepth(9999999);
        if(this.actor.scene.physics.world.drawDebug) {
            this.debugGraphics = this.actor.scene.add.graphics();
        }

        this.tolerance = this.actor.movementSpeed.maxSpeed * 1.5 / this.actor.scene.game.loop.targetFps;
        this.threshold = ENEMY_STOP_THRESHOLD;
        // this.squaredTolerance = this.tolerance * this.tolerance;
    }

    private calculateGridPosition(x: number, y: number): [number, number] {
        return [Math.floor(x / MAP_TILE_SIZE), Math.floor(y / MAP_TILE_SIZE)];
    }

    public moveToTarget(target: Phaser.Math.Vector2) {
        // Flip entity sprite based on target position
        const currentDirection = Math.sign(target.x - this.actor.x);
        if (currentDirection !== 0) {
            this.actor.setFlipX(currentDirection < 0);
        }

        // If target position hasn't changed, then don't update path
        // const [gridTargetX, gridTargetY] = this.calculateGridPosition(target.x, target.y);
        // const [actorGridX, actorGridY] = this.calculateGridPosition(this.actor.x, this.actor.y);

        // const start = { x: actorGridX, y: actorGridY };
        // const end = { x: gridTargetX, y: gridTargetY };

        // this.actor.scene.pathfindingManager.findPath(start, end, (path) => {
        //     if (!path || path.length === 0 || path.length === 2) {
        this.target.set(target.x, target.y);
        this.actor.scene.physics.moveToObject(this.actor, target, this.actor.movementSpeed.baseSpeed);
        this.isMovingToTarget = true;
        this.currentPath.length = 0; // Clear the path array
        this.currentPathIndex = 0;
        return;
        // }

        // if (path.length > 0 && path.length !== 2) {
        //     this.currentPath.length = path.length; // Resize the array if necessary
        //     for (let i = 0; i < path.length; i++) {
        //         const [gridX, gridY] = path[i];
        //         // Avoid creating new objects inside the loop
        //         if (this.currentPath[i]) {
        //             this.currentPath[i].x = gridX * MAP_TILE_SIZE + MAP_TILE_SIZE / 2;
        //             this.currentPath[i].y = gridY * MAP_TILE_SIZE + MAP_TILE_SIZE / 2;
        //         } else {
        //             this.currentPath[i] = { x: gridX * MAP_TILE_SIZE + MAP_TILE_SIZE / 2, y: gridY * MAP_TILE_SIZE + MAP_TILE_SIZE / 2 };
        //         }
        //     }
        //     this.currentPathIndex = 0;
        //     this.isMovingToTarget = true;
        //
        //     // Draw the path for debugging purposes
        //     // this.drawPath(this.currentPath);
        // }
        // });
    }

    stopMovement() {
        this.isMovingToTarget = false;
        this.currentPath.length = 0;
        this.actor.body.stop();
        this.actor.setRotation(0);
    }

    update() {
        if (this.isMovingToTarget) {
            if (this.currentPath.length > 0) {
                const targetPoint = this.currentPath[this.currentPathIndex];

                const distance = Phaser.Math.Distance.Between(this.actor.x, this.actor.y, targetPoint.x, targetPoint.y);

                if (this.actor.body.speed > 0 && distance < this.tolerance) {
                    this.currentPathIndex++;


                    if (this.currentPathIndex < this.currentPath.length) {
                        // Check if we should flip the sprite
                        const nextTargetPoint = this.currentPath[this.currentPathIndex];
                        this.checkFlipSprite(targetPoint, nextTargetPoint);
                        return;
                    } else {
                        this.stopMovement();
                        return;
                    }
                } else {
                    this.actor.scene.physics.moveToObject(this.actor, targetPoint, this.actor.movementSpeed.baseSpeed);
                    return;
                }
                // Cases we want just to move directly to target when path is empty
            } else {
                if (this.actor.getActorType() === ActorType.Player) {
                    this.threshold = PLAYER_STOP_THRESHOLD;
                } else {
                    this.threshold = ENEMY_STOP_THRESHOLD;
                }

                if (this.debugGraphics) {
                    this.debugGraphics.clear();
                    this.debugGraphics.setDepth(1111);
                    this.debugGraphics.lineStyle(2, 0x800080);
                    this.debugGraphics.strokeCircle(this.actor.x, this.actor.y, Math.sqrt( this.threshold)); // Radius is the square root of distanceSquared
                }

                const dx = this.target.x - this.actor.x;
                const dy = this.target.y - this.actor.y;
                const squaredDistance = dx * dx + dy * dy;

                if (squaredDistance <  this.threshold) {
                    this.stopMovement();
                    return;
                }

            }

            this.actor.setRotation(Math.sin(this.actor.scene.time.now * 0.03) * 0.1);
        }
    }

    private checkFlipSprite(currentPoint: { x: number, y: number }, nextPoint: { x: number, y: number }) {
        const currentDirection = Math.sign(nextPoint.x - currentPoint.x);
        if (currentDirection !== 0) {
            this.actor.setFlipX(currentDirection < 0);
        }
    }

    public drawPath(worldPath: { x: number, y: number }[]) {
        this.pathGraphics.clear(); // Clear previous paths
        this.pathGraphics.lineStyle(4, 0xffff00, 1); // Set the line style to a 4px wide yellow line

        this.pathGraphics.beginPath();

        // Start from the first point
        this.pathGraphics.moveTo(worldPath[0].x, worldPath[0].y);

        // Draw lines to subsequent points
        worldPath.forEach((point) => {
            this.pathGraphics.lineTo(point.x, point.y);
        });

        this.pathGraphics.strokePath(); // Apply the stroke to draw the path
    }
}
