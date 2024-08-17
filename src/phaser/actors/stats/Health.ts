import  { ActorType } from '@/phaser/actors/IActor';
import { usePlayerStore } from '@/stores/usePlayerStore';

export class Health {
    private _baseHealth = 100;
    private _currentHealth = 100;
    private _maxHealth = 100;
    private _healthRegenRate = 1;
    private lastRegenTime = 0;
    private _regenInterval = 1000; // milliseconds, adjust as needed

    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here
    private readonly _isPlayer: boolean;

    constructor(
        baseHealth: number,
        healthRegenRate: number,
        regenInterval: number,
        actorType: ActorType,
    ) {
        this._isPlayer = actorType === ActorType.Player;
        this._baseHealth = baseHealth;
        this._currentHealth = baseHealth;
        this._maxHealth = baseHealth;
        this._healthRegenRate = healthRegenRate;
        this._regenInterval = regenInterval;
        // Similar to mana, you might want to listen to changes in the player's attributes
        if (this._isPlayer) {
            this._playerStore = usePlayerStore();
            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setHealth') {
                    this.setHealthFromStore(...args);
                }
            });
        }
    }

    updateMaxHealthByAttributes(strength: number, vitality: number) {
        const additionalHealthFromStrength = strength * 2;
        const additionalHealthFromVitality = vitality * 10;
        // Ensure you update the base health if necessary or just add the additional health to the existing base health
        this.maxHealth = this._baseHealth + additionalHealthFromStrength + additionalHealthFromVitality;
    }

    private setHealthFromStore(health: {
        baseHealth: number;
        currentHealth: number;
        maxHealth: number;
        healthRegenRate: number;
        regenInterval: number;
    }) {
        this._baseHealth = health.baseHealth;
        this._currentHealth = health.currentHealth;
        this._maxHealth = health.maxHealth;
        this._healthRegenRate = health.healthRegenRate;
        this._regenInterval = health.regenInterval;
    }

    private syncWithPlayerStore() {
        if (!this._isPlayer || !this._playerStore) return;
        this._playerStore.setHealth({
            baseHealth: this._baseHealth,
            currentHealth: this._currentHealth,
            maxHealth: this._maxHealth,
            healthRegenRate: this._healthRegenRate,
            regenInterval: this._regenInterval,
        });
    }

    get regenInterval(): number {
        return this._regenInterval;
    }

    set regenInterval(value: number) {
        if (value < 0) {
            throw new Error('Regen interval cannot be negative.');
        }
        this._regenInterval = value;

        this.syncWithPlayerStore();
    }

    get healthRegenRate(): number {
        return this._healthRegenRate;
    }

    set healthRegenRate(value: number) {
        if (value < 0) {
            throw new Error('Health regeneration rate cannot be negative.');
        }
        this._healthRegenRate = value;

        this.syncWithPlayerStore();
    }

    get baseHealth(): number {
        return this._baseHealth;
    }

    set baseHealth(value: number) {
        // This will validate the value and assign it to the private field,
        // avoiding any recursive calls to the setter itself.
        this._baseHealth = Math.max(0, Math.min(value, this._maxHealth));

        this.syncWithPlayerStore();
    }

    get currentHealth(): number {
        return this._currentHealth;
    }

    set currentHealth(value: number) {
        // This will validate the value and assign it to the private field,
        // avoiding any recursive calls to the setter itself.
        this._currentHealth = Math.max(0, Math.min(value, this._maxHealth));
        this.syncWithPlayerStore();
    }

    get maxHealth(): number {
        return this._maxHealth;
    }

    set maxHealth(value: number) {
        if (value < 0) {
            throw new Error('Max health cannot be negative.');
        }
        this._maxHealth = value;

        if (this._currentHealth > value) {
            this._currentHealth = value; // Ensure current health does not exceed new max health
        }
        this.syncWithPlayerStore();
    }

    takeDamage(amount: number) {
        // No direct call to the _playerStore.setHealth needed here anymore
        this._currentHealth = Math.max(this._currentHealth - amount, 0);

        this.syncWithPlayerStore();
    }

    heal(amount: number) {
        // No direct call to the _playerStore.setHealth needed here anymore
        this._currentHealth = Math.min(this._currentHealth + amount, this._maxHealth);
        this.syncWithPlayerStore();
    }

    resetCurrentHealth() {
        this.currentHealth = this._maxHealth; // Use the setter to ensure any associated logic is executed
        // No need to call this.syncWithPlayerStore() if the setter already handles synchronization
    }

    isAlive(): boolean {
        return this._currentHealth > 0;
    }

    regenHealth(deltaTime: number) {
        if (
            this._currentHealth < this._maxHealth &&
            this._healthRegenRate > 0 &&
            deltaTime - this.lastRegenTime >= this._regenInterval
        ) {
            this.heal(this._healthRegenRate);
            this.lastRegenTime = deltaTime;
        }
    }
}
