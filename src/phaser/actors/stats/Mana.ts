import { usePlayerStore } from '@/stores/usePlayerStore';
import { ActorType } from '@/phaser/actors/IActor';


export class Mana {
    private _baseMana = 100;
    private _currentMana = 100;
    private _maxMana = 100;
    private _manaRegenRate = 1;
    private lastRegenTime = 0;
    private _regenInterval = 1000; // milliseconds, adjust as needed

    private readonly _isPlayer: boolean;
    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here

    constructor(
        baseMana: number,
        manaRegenRate: number,
        regenInterval: number,
        actorType: ActorType,
    ) {
        this._isPlayer = actorType === ActorType.Player;
        this._baseMana = baseMana;
        this._currentMana = baseMana;
        this._maxMana = baseMana;
        this._manaRegenRate = manaRegenRate;
        this._regenInterval = regenInterval;

        // Subscribe only if this ActorMana instance is related to the player.
        if (this._isPlayer) {
            this._playerStore = usePlayerStore();
            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setMana') {
                    this.setManaFromStore(...args);
                }
            });
        }
    }

    updateMaxManaByAttributes(intelligence: number) {
        const additionalManaFromIntelligence = intelligence * 10;
        this.maxMana = this._baseMana + additionalManaFromIntelligence;
    }

    private setManaFromStore(mana: {
    baseMana: number;
    currentMana: number;
    maxMana: number;
    manaRegenRate: number;
    regenInterval: number;
  }) {
        this._baseMana = mana.baseMana;
        this._currentMana = mana.currentMana;
        this._maxMana = mana.maxMana;
        this._manaRegenRate = mana.manaRegenRate;
        this._regenInterval = mana.regenInterval;
    }

    get baseMana(): number {
        return this._baseMana;
    }

    set baseMana(value: number) {
        if (value < 0) {
            throw new Error('Mana regeneration rate cannot be negative.');
        }
        this._baseMana = value;

        this.syncWithPlayerStore();
    }

    get regenInterval(): number {
        return this._regenInterval;
    }

    set regenInterval(value: number) {
        if (value < 0) {
            throw new Error('Mana regeneration rate cannot be negative.');
        }
        this._regenInterval = value;

        this.syncWithPlayerStore();
    }

    get manaRegenRate(): number {
        return this._manaRegenRate;
    }

    set manaRegenRate(value: number) {
        if (value < 0) {
            throw new Error('Mana regeneration rate cannot be negative.');
        }
        this._manaRegenRate = value;

        this.syncWithPlayerStore();
    }

    private syncWithPlayerStore() {
        if (!this._isPlayer || !this._playerStore) return;
        this._playerStore.setMana({
            baseMana: this._baseMana,
            currentMana: this._currentMana,
            maxMana: this._maxMana,
            manaRegenRate: this._manaRegenRate,
            regenInterval: this._regenInterval,
        });
    }

    get currentMana(): number {
        return this._currentMana;
    }

    set currentMana(value: number) {
        this._currentMana = Math.max(0, Math.min(value, this.maxMana));
        this.syncWithPlayerStore();
    }

    get maxMana(): number {
        return this._maxMana;
    }

    set maxMana(value: number) {
        if (value < 0) {
            throw new Error('Max mana cannot be negative.');
        }
        this._maxMana = value;
        if (this._currentMana > value) {
            this._currentMana = value; // Ensure current mana does not exceed new max mana
        }

        this.syncWithPlayerStore();
    }

    useMana(amount: number): boolean {
        if (this._currentMana >= amount) {
            this._currentMana -= amount;
            this.syncWithPlayerStore();
            return true; // There was enough mana, and the mana has been used.
        } else {
            return false; // Not enough mana to use.
        }
    }

    private regenerateMana(amount: number) {
        this.currentMana = Math.min(this._currentMana + amount, this._maxMana);
        this.syncWithPlayerStore();
    }

    resetCurrentMana() {
        this.currentMana = this._maxMana; // This now uses the setter
    }

    private hasMana(amount: number): boolean {
        return this.currentMana >= amount;
    }

    regenMana(deltaTime: number) {
        if (
            this._currentMana < this._maxMana &&
      this._manaRegenRate > 0 &&
      deltaTime - this.lastRegenTime >= this._regenInterval
        ) {
            this.regenerateMana(this._manaRegenRate);
            this.lastRegenTime = deltaTime;
        }
    }
}
