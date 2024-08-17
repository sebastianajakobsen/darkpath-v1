import { usePlayerStore } from '@/stores/usePlayerStore';
import { ActorType } from '@/phaser/actors/IActor';


export class Combat {
    private _baseDamage!: number;
    private _dodgeChance!: number;
    private _critMultiplier!: number;
    private _hitChance!: number;
    private _critChance!: number;
    private _castSpeedModifier: number; // Default: no modification

    private readonly _isPlayer: boolean;
    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here

    constructor(
        baseDamage: number,
        dodgeChance: number,
        hitChance: number,
        critChance: number,
        critMultiplier: number,
        actorType: ActorType,
        castSpeedModifier = 1.0,
    ) {
        this._baseDamage = baseDamage;
        this._dodgeChance = dodgeChance;
        this._hitChance = hitChance;
        this._critChance = critChance;
        this._critMultiplier = critMultiplier;
        this._castSpeedModifier = castSpeedModifier;

        this._isPlayer = actorType === ActorType.Player;
        if (this._isPlayer) {
            this._playerStore = usePlayerStore();

            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setCombatStats') {
                    this.setCombatStatsFromStore(...args);
                }
            });
        }
    }

    private setCombatStatsFromStore(combatStats: {
    baseDamage: number;
    dodgeChance: number;
    hitChance: number;
    critChance: number;
    critMultiplier: number;
  }) {
        this._baseDamage = combatStats.baseDamage;
        this._dodgeChance = combatStats.dodgeChance;
        this._hitChance = combatStats.hitChance;
        this._critChance = combatStats.critChance;
        this._critMultiplier = combatStats.critMultiplier;
    }

    private syncWithPlayerStore(): void {
        if (!this._isPlayer || !this._playerStore) return;
        this._playerStore.setCombatStats({
            baseDamage: this._baseDamage,
            dodgeChance: this._dodgeChance,
            critMultiplier: this._critMultiplier,
            hitChance: this._hitChance,
            critChance: this._critChance,
            castSpeedModifier: this._castSpeedModifier,
        });
    }

    get castSpeedModifier(): number {
        return this._castSpeedModifier;
    }

    set castSpeedModifier(value: number) {
        this._castSpeedModifier = value;
        this.syncWithPlayerStore();
    }

    // Using TypeScript's getter and setter syntax
    get baseDamage(): number {
    // You might want to apply some attribute bonuses here
        return this._baseDamage;
    }

    set baseDamage(value: number) {
    // You could apply constraints here if needed
        this._baseDamage = value;
        this.syncWithPlayerStore();
    }

    get dodgeChance(): number {
    // Apply any relevant logic or constraints
        return this._dodgeChance;
    }

    set dodgeChance(value: number) {
        this._dodgeChance = value;
        this.syncWithPlayerStore();
    }

    get critMultiplier(): number {
    // Apply any relevant logic or constraints
        return this._critMultiplier;
    }

    set critMultiplier(value: number) {
        this._critMultiplier = value;
        this.syncWithPlayerStore();
    }

    get hitChance(): number {
    // Apply any relevant logic or constraints
        return this._hitChance;
    }

    set hitChance(value: number) {
        this._hitChance = value;
        this.syncWithPlayerStore();
    }

    get critChance(): number {
    // Apply any relevant logic or constraints
        return this._critChance;
    }

    set critChance(value: number) {
        this._critChance = value;
        this.syncWithPlayerStore();
    }
}
