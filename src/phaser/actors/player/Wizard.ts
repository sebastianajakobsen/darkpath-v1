import type { BaseScene } from '@/phaser/scenes/BaseScene';
import { Player } from '@/phaser/actors/player/Player';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { Level } from '@/phaser/actors/stats/Level';
import { Health } from '@/phaser/actors/stats/Health';
import { ActorType } from '@/phaser/actors/IActor';
import { HealthBar } from '@/phaser/ui/HealthBar';
import { MovementSpeed } from '@/phaser/actors/stats/MovementSpeed';
import { MovementManager } from '@/phaser/actors/MovementManager';
import { Mana } from '@/phaser/actors/stats/Mana';
import { Combat } from '@/phaser/actors/stats/Combat';
import { Attributes } from '@/phaser/actors/stats/Attributes';

export class Wizard extends Player {

    constructor(scene: BaseScene, x: number, y: number) {
        super(scene, x, y, 'wizard');
        this.scene = scene;

        this.setSize(35, 60);

        const playerStore = usePlayerStore();

        // TODO: might need to add from save file whenever i add something like that

        // makes sure to use the store value if the player is already initlized
        // else we create a new player - this is only on first create
        // if (!playerStore.initialized) {
        // General stats, attributes, damage for entity
        this.level = new Level(20, ActorType.Player);
        this.health = new Health(20000, 10, 500, ActorType.Player);
        this.healthBar = new HealthBar(scene, this);
        this.mana = new Mana(20000, 50, 1000, ActorType.Player);
        this.combat = new Combat(30, 5, 95, 5, 100, ActorType.Player);
        this.attributes = new Attributes(
            23,
            25,
            22,
            10,
            this.health,
            this.mana,
            this.combat,
            ActorType.Player,
        ); // default for player 30 attributes points



        this.movementSpeed = new MovementSpeed(250, ActorType.Player);
        this.movementManager = new MovementManager(this);

        // TODO: add theses? - remember to update store also
        // this.armor = new Armor(0, ActorType.Player);
        // this.resistance = new ActorResistance(magicDefenseValue);
        this.health.resetCurrentHealth();
        this.mana.resetCurrentMana();

        playerStore.setInitialized(); // flag the player as initialized so we dont recreate the player stats over from starts
        // } else {
        //   // reuse the store values instead
        // }
    }
}
