import { usePlayerStore } from '@/stores/usePlayerStore';
import  { ActorType } from '@/phaser/actors/IActor';


export class Level {
    private _level!: number;

    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here
    private readonly _isPlayer: boolean;

    constructor(initialLevel: number = 1, actorType: ActorType) {
        this._isPlayer = actorType === ActorType.Player;
        this._level = initialLevel;
        if (this._isPlayer) {
            this._playerStore = usePlayerStore();
            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setLevel') {
                    this.setLevelFromStore(...args);
                }
            });
        }
    }

    private setLevelFromStore(level: number) {
        this._level = level;
    }

    get level(): number {
        return this._level;
    }

    set level(newLevel: number) {
        if (newLevel >= 1 && newLevel !== this._level) {
            this._level = newLevel;
            this.syncWithPlayerStore();
        } else if (newLevel < 1) {
            // Handle invalid level assignment
            // For example, throw an error or log a warning:
            throw new Error('Level must be 1 or greater.');
        }
    }

    levelUp(): void {
        this.level = this.level + 1; // Use the setter to ensure validation and syncing
    // Additional logic for leveling up can be added here
    }

    private syncWithPlayerStore(): void {
        if (!this._isPlayer || !this._playerStore) return;
        this._playerStore.setLevel(this._level);
    }

    // Other methods related to level can be added here...
}
