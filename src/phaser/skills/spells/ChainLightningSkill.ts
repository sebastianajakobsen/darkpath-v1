import type { BaseScene } from '@/phaser/scenes/BaseScene';
import type { Actor } from '@/phaser/actors/Actor';
import { Skill } from '@/phaser/skills/Skill';

export class ChainLightningSkill extends Skill {
    private chains: number = 10;
    private jumpRadius: number = 400; // Treated as the radius for the circular search
    private readonly hitEnemies: Set<Phaser.GameObjects.GameObject>;
    private targetVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private debugGraphics: Phaser.GameObjects.Graphics;
    private attackAudio!: any;
    private attackAudio2!: any;
    private attackAudio3!: any;

    constructor(scene: BaseScene, x: number, y: number, actor: Actor, spellConfig: any) {
        super(scene, x, y, 'chain_lightning_skill_effect', 'chain-lightning', actor, spellConfig, false);
        this.attackAudio = this.scene.sound.add('chain_lightning_attack_audio', { volume: 0.5, loop: false, rate: 1 });
        this.attackAudio2 = this.scene.sound.add('chain_lightning_attack_audio2', { volume: 0.5, loop: false, rate: 1 });
        this.attackAudio3 = this.scene.sound.add('chain_lightning_attack_audio3', { volume: 0.5, loop: false, rate: 1 });
        this.hitEnemies = new Set();
        this.debugGraphics = this.scene.add.graphics();
    }

    public cast(targetPoint: Phaser.Math.Vector2) {
        this.setPosition(this.actor.x, this.actor.y);
        this.hitEnemies.clear();
        this.chainHit(this.actor, targetPoint, this.chains);
    }

    private async chainHit(currentActor: Actor, targetPoint: Phaser.Math.Vector2, remainingJumps: number, lastHitEnemy: Actor | null = null) {
        if (remainingJumps <= 0) {
            this.deactivate();
            return;
        }

        const closestEnemy = this.findClosestEnemyNearPoint(
            targetPoint.x, targetPoint.y, this.jumpRadius, this.hitEnemies,
        );



        if (closestEnemy) {
            this.targetVector.set(closestEnemy.x, closestEnemy.y);
            this.hitEnemies.add(closestEnemy);

            // Calculate the current distance squared from the initial position
            const dx = closestEnemy.x - this.actor.x;
            const dy = closestEnemy.y - this.actor.y;
            const distanceFromInitialSquared = dx * dx + dy * dy;

            // Define the maximum distance squared for full volume and the minimum volume at max range
            const maxDistanceSquared = 640000;  // Adjust as needed to fit your game's scale
            const minVolume = 0.01;  // Minimum volume at max distance
            const maxVolume = 0.3;  // Full volume at zero distance

            // Calculate the new volume as a percentage of the maximum based on distance
            let newVolume: number;
            if (distanceFromInitialSquared < maxDistanceSquared) {
                // Calculate the percentage of the max volume based on the inverse of the distance percentage
                newVolume = maxVolume * (1 - (distanceFromInitialSquared / maxDistanceSquared));
            } else {
                // Use minimum volume if beyond the max distance
                newVolume = minVolume;
            }

            // Ensure volume never drops below the minimum threshold
            newVolume = Math.max(newVolume, minVolume);

            console.log('newVolume', newVolume);
            // randomly play one of the three audio clips
            const random = Math.random();
            if (random < 0.33) {
                this.attackAudio.play({ volume: newVolume });
            } else if (random < 0.66) {
                this.attackAudio2.play({ volume: newVolume });
            } else {
                this.attackAudio3.play({ volume: newVolume });
            }
            this.actor.applyDamage(this.actor, closestEnemy, this.spellConfig.properties.baseDamage);
            console.log(`Chain lightning hit enemy at (${closestEnemy.x}, ${closestEnemy.y}) with ${remainingJumps - 1} jumps left.`);
            await this.drawLineEffect(currentActor, closestEnemy);

            this.chainHit(closestEnemy, this.targetVector, remainingJumps - 1, closestEnemy);
        } else {
            await this.drawLineEffect(currentActor, targetPoint);
            this.deactivate();
        }
    }

    private findClosestEnemyNearPoint(x: number, y: number, distance: number, excludedEnemies: Set<Phaser.GameObjects.GameObject>): Actor | null {
        let closestEnemy: Actor | null = null;
        let closestDistance = distance;

        this.drawDebugCircle({ x, y }, distance);

        // Uses Phaser's RTree optimized search method
        const bodiesInCircle = this.scene.physics.overlapCirc(x, y, distance, true, false);

        const filteredResults = bodiesInCircle.filter(body => {
            const gameObject = body.gameObject as Actor;
            const isNotSelf = gameObject.id !== this.actor.id; // Ensure the actor is not the casting actor
            return gameObject.active && !excludedEnemies.has(gameObject) && isNotSelf && gameObject.isActor;
        });

        filteredResults.forEach(body => {
            const enemy = body.gameObject as Actor;
            const enemyDistance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (enemyDistance < closestDistance) {
                closestDistance = enemyDistance;
                closestEnemy = enemy;
            }
        });

        return closestEnemy;
    }

    private drawDebugCircle(center: { x: number, y: number }, radius: number) {
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, 0xff0000, 1);
        this.debugGraphics.strokeCircle(center.x, center.y, radius);
    }

    private async drawLineEffect(startObj: Phaser.GameObjects.GameObject, endObj: Phaser.GameObjects.GameObject | Phaser.Math.Vector2): Promise<void> {
        return new Promise(resolve => {
            const angle = Phaser.Math.Angle.Between(startObj.x, startObj.y, endObj.x, endObj.y);
            const distance = Phaser.Math.Distance.Between(startObj.x, startObj.y, endObj.x, endObj.y);
            this.setVisible(true);
            this.setRotation(angle);
            this.setScale(distance / this.width, 1);
            this.setOrigin(0, 0.5);
            this.scene.time.delayedCall(200, () => {
                this.setVisible(false);
                this.setPosition(endObj.x, endObj.y);
                resolve();
            });
        });
    }
}
