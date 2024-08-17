import { Enemy } from '@/phaser/actors/enemy/Enemy';
import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { Health } from '@/phaser/actors/stats/Health';
import { ActorType } from '@/phaser/actors/IActor';
import { MovementSpeed } from '@/phaser/actors/stats/MovementSpeed';
import { MovementManager } from '@/phaser/actors/MovementManager';
import { Mana } from '@/phaser/actors/stats/Mana';
import { Combat } from '@/phaser/actors/stats/Combat';
import { Attributes } from '@/phaser/actors/stats/Attributes';
import { Level } from '@/phaser/actors/stats/Level';


export class Zombie extends Enemy {
    constructor(scene: BaseScene, x: number, y: number) {
        super(scene, x, y, 'zombie');
        this.setSize(35, 60);

        // General stats, attributes, damage for entity
        this.level = new Level(1, ActorType.Enemy);
        this.health = new Health(200, 0, 0, ActorType.Enemy);

        this.movementSpeed = new MovementSpeed(130, ActorType.Enemy);
        this.movementManager = new MovementManager(this);

        this.mana = new Mana(10, 0, 0, ActorType.Enemy);
        this.combat = new Combat(5, 5, 1, 5, 100, ActorType.Enemy);
        this.attributes = new Attributes(
            23,
            25,
            22,
            2,
            this.health,
            this.mana,
            this.combat,
            ActorType.Enemy,
        ); // default for player 30 attributes points

        // TODO: add theses? - remember to update store also
        // this.armor = new Armor(0, ActorType.Enemy);
        // this.resistance = new ActorResistance(magicDefenseValue);

        this.health.resetCurrentHealth();
        this.mana.resetCurrentMana();

        // stats & attributes
        //
        // this.attackCooldown = 2000;
        // this.attackRadius = 64;
        // // create the testAttackImage and initially hide it
        // const meleeAttack = this.scene.add
        //     .image(x, y, 'skeletonMeleeAttack')
        //     .setDepth(8)
        //     .setVisible(false);
        // this.attackStrategy = new EnemyMeleeAttack(this, meleeAttack);
    }
}
