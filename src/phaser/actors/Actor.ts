import { Entity } from '@/phaser/Entity';
import { MovementManager } from '@/phaser/actors/MovementManager';
import type { MovementSpeed } from '@/phaser/actors/stats/MovementSpeed';
import type { Health } from '@/phaser/actors/stats/Health';
import { HealthBar } from '@/phaser/ui/HealthBar';
import type { Level } from '@/phaser/actors/stats/Level';
import type { Mana } from '@/phaser/actors/stats/Mana';
import type { Combat } from '@/phaser/actors/stats/Combat';
import type { Attributes } from '@/phaser/actors/stats/Attributes';
import type { Armor } from '@/phaser/items/armor/Armor';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { ActorType } from '@/phaser/actors/IActor';

export class Actor extends Entity {
    movementManager!: MovementManager;
    healthBar!: HealthBar;

    movementSpeed!: MovementSpeed;
    health!: Health;
    level!: Level;
    mana!: Mana;
    combat!: Combat;
    attributes!: Attributes;
    armor!: Armor;

    protected actorType!: ActorType;

    constructor(scene: BaseScene, x: number, y: number, texture: string, actorType: ActorType) {
        super(scene, x, y, texture, true);
        this.actorType = actorType;
    }

    takeDamage(damage: number) {
        this.health.takeDamage(damage);

        // only create health bar if actor is alive
        if(this.isAlive() && !this.healthBar) {
            this.healthBar = new HealthBar(this.scene, this);
        }
        
    }

    applyDamage(target: Actor, attacker: Actor, damage: number) {
        return this.scene.damageManager.applyDamage(target, attacker, damage);
    }

    isPlayer(): boolean {
        return this.actorType === ActorType.Player;
    }

    useMana(amount: number) {
        return this.mana.useMana(amount);
    }

    isEnemy(): boolean {
        return this.actorType === ActorType.Enemy;
    }

    getActorType() {
        return this.actorType;
    }

    isAlive() {
        return this.health.isAlive();
    }

    handleDeathAnimation(): Promise<void> {
        this.movementManager.stopMovement();
        return this.startDissolveEffect();
    }

    startDissolveEffect(): Promise<void> {
        return new Promise((resolve) => {
            this.setTint(0xff0000);
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 200,
                ease: 'Power0',
                onComplete: () => {
                    resolve();
                },
            });
        });
    }

    update() {
        super.update();
        if(this.healthBar) {
            this.healthBar.update();
        }

        this.health.regenHealth(this.scene.time.now);
        this.mana.regenMana(this.scene.time.now);

        this.movementManager.update();
    }

    destroy() {
        super.destroy();

        if(this.healthBar) {
            this.healthBar.destroy();
        }
    }
}