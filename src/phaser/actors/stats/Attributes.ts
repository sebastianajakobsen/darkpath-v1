import { usePlayerStore } from '@/stores/usePlayerStore';
import type { Combat } from '@/phaser/actors/stats/Combat';
import type { Health } from '@/phaser/actors/stats/Health';
import type { Mana } from '@/phaser/actors/stats/Mana';
import { ActorType } from '@/phaser/actors/IActor';

export class Attributes {
    private _strength!: number; // each point should give +10 attack power and +2 hp and +2 armor
    private _dexterity!: number;
    private _intelligence!: number; // each point should +10 mana and?
    private _vitality!: number; // each point should give +10 hp

    private actorCombatStats: Combat;
    private actorHealth: Health;
    private actorMana: Mana;

    private readonly _isPlayer: boolean;
    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here

    constructor(
        strength: number,
        dexterity: number,
        intelligence: number,
        vitality: number,
        actorHealth: Health,
        actorMana: Mana,
        actorCombatStats: Combat,
        actorType: ActorType,
    ) {
        this._strength = strength;
        this._dexterity = dexterity;
        this._intelligence = intelligence;
        this._vitality = vitality;

        // other classes that updates base on attributes
        this.actorCombatStats = actorCombatStats;
        this.actorHealth = actorHealth;
        this.actorMana = actorMana;

        // Update health and mana based on attributes
        this.actorHealth.updateMaxHealthByAttributes(this._strength, this._vitality);
        this.actorMana.updateMaxManaByAttributes(this._intelligence);

        this._isPlayer = actorType === ActorType.Player;

        if (this._isPlayer) {
            this._playerStore = usePlayerStore();

            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setAttributes') {
                    this.setAttributesFromStore(...args);
                }
            });
        }
    }

    private setAttributesFromStore(attributes: {
    strength: number;
    dexterity: number;
    intelligence: number;
    vitality: number;
  }) {
        this._strength = attributes.strength;
        this._dexterity = attributes.dexterity;
        this._intelligence = attributes.intelligence;
        this._vitality = attributes.vitality;

        console.log('setAttributesFromStore');

        // Update health and mana based on attributes
        this.actorHealth.updateMaxHealthByAttributes(this._strength, this._vitality);
        this.actorMana.updateMaxManaByAttributes(this._intelligence);
    }

    // Update the PlayerStore with new attributes and calculated bonuses
    private syncWithPlayerStore() {
        if (!this._playerStore || !this._isPlayer) return;

        // Update the store with new base attributes
        this._playerStore.setAttributes({
            strength: this._strength,
            dexterity: this._dexterity,
            intelligence: this._intelligence,
            vitality: this._vitality,
        });
    }

    get vitality(): number {
        return this._vitality;
    }

    set vitality(newVitality: number) {
        this._vitality = Math.max(0, newVitality);
        this.actorHealth.updateMaxHealthByAttributes(this._strength, this._vitality);
        this.syncWithPlayerStore();
    }

    get strength(): number {
        return this._strength;
    }

    set strength(newStrength: number) {
        this._strength = Math.max(0, newStrength);
        this.actorHealth.updateMaxHealthByAttributes(this._strength, this._vitality);
        this.syncWithPlayerStore();
    }

    get dexterity(): number {
        return this._dexterity;
    }

    set dexterity(newDexterity: number) {
        this._dexterity = Math.max(0, newDexterity);
    }

    get intelligence(): number {
        return this._intelligence;
    }

    set intelligence(newIntelligence: number) {
        this._intelligence = Math.max(0, newIntelligence);
        this.actorMana.updateMaxManaByAttributes(this._intelligence);
        this.syncWithPlayerStore();
    }
}
