import { usePlayerStore } from '@/stores/usePlayerStore';
import { ActorType } from '@/phaser/actors/IActor';


export class Armor {
    private _armorValue!: number;

    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here
    private readonly _isPlayer: boolean;

    constructor(initialArmor: number = 0, actorType: ActorType) {
        this._isPlayer = actorType === ActorType.Player;
        this._armorValue = initialArmor;
        if (this._isPlayer) {
            this._playerStore = usePlayerStore();
            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setArmor') {
                    this.setArmorFromStore(...args);
                }
            });
        }
    }

    private setArmorFromStore(armor: number) {
        this._armorValue = armor;
    }

    get armor(): number {
        return this._armorValue;
    }

    set armor(newLevel: number) {
        if (newLevel !== this._armorValue) {
            this._armorValue = newLevel;
            this.syncWithPlayerStore();
        }
    }

    private syncWithPlayerStore(): void {
        if (!this._isPlayer || !this._playerStore) return;
        this._playerStore.setArmor(this._armorValue);
    }

    // Other methods related to level can be added here...
}
