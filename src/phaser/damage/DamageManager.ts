import type { Actor } from '@/phaser/actors/Actor';
import { BaseScene } from '@/phaser/scenes/BaseScene';
import { DamageTextManager } from '@/phaser/damage/DamageTextManager';
import { dropItemBasedOnLevel, shouldDropItem } from '@/phaser/DropSystem';
import { Enemy } from '@/phaser/actors/enemy/Enemy';
import { Player } from '@/phaser/actors/player/Player';
import { ItemDrop } from '@/phaser/items/ItemDrop';

export class DamageManager {
    damageTextManager!: DamageTextManager;

    constructor(scene: BaseScene) {
        this.damageTextManager = new DamageTextManager(scene);
    }


    calculateDamage(isCrit: boolean, baseDamage: number, critMultiplier: number): number {
    // Calculate the actual damage based on whether the attack is critical
        return isCrit ? baseDamage * (1 + critMultiplier / 100) : baseDamage;
    }

    createAndDisplayDamageText(target: Actor, text: string, isCrit = false) {
        if (target.isPlayer()) return;
        this.damageTextManager.showDamageText(target.x, target.y, text, isCrit);
    }

    applyDamage(attacker: Actor, target: Actor, damage: number) {
        // console.log('target', target);
        if (!target.isAlive()) {
            return;
        }

        const hitRoll = Math.random() * 100;
        //
        // console.log(attacker);
        // Early exit if the hit misses
        if (hitRoll > attacker.combat.hitChance) {
            this.createAndDisplayDamageText(target, 'miss');
            return;
        }

        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= attacker.combat.critChance;
        const actualDamage = this.calculateDamage(isCrit, damage, attacker.combat.critMultiplier);

        target.takeDamage(actualDamage);

        // console.log(actualDamage);

        this.createAndDisplayDamageText(target, `${actualDamage}`, isCrit);

        if (!target.isAlive() && target instanceof Enemy && shouldDropItem()) {
            const items = dropItemBasedOnLevel(target.level.level);
            if (items) {
                items.forEach((item) => {
                    // Ensures that the target's scene is a BaseScene and the attacker is a Player before creating the item drop
                    if (attacker instanceof Player) {
                        new ItemDrop(attacker.scene, target.x, target.y, item);
                    }
                });
            }
        }

        // TODO: maybe only destroy if the target is an enemy
        if(!target.isAlive()) {
            target.deactivate();

            // target.destroy();
        }
    }
}
