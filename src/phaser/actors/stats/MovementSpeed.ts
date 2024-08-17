import { ActorType } from '@/phaser/actors/IActor';
import { usePlayerStore } from '@/stores/usePlayerStore';

export class MovementSpeed {
    private _baseSpeed!: number;

    private readonly _isPlayer: boolean;
    private readonly _playerStore?: ReturnType<typeof usePlayerStore>; // Notice we're not calling the function here

    constructor(baseSpeed: number, actorType: ActorType) {
        this._isPlayer = actorType === ActorType.Player;
        this._baseSpeed = baseSpeed;
        if (this._isPlayer) {
            this._playerStore = usePlayerStore();

            this.syncWithPlayerStore();

            this._playerStore.$onAction(({ name, args }) => {
                if (name === 'setBaseMovementSpeed') {
                    this.setMovementSpeedFromStore(...args);
                }
            });
        }
    }

    private setMovementSpeedFromStore(baseSpeed: number /* other args */) {
        this._baseSpeed = baseSpeed;
        // Update other properties with the new args here.
    }

    private syncWithPlayerStore(): void {
        if (!this._isPlayer || !this._playerStore) return;
        // Assuming you have an _isPlayer flag in your level class
        // this._playerStore.setBaseMovementSpeed(this.baseSpeed);
    }

    set baseSpeed(speed: number) {
        this._baseSpeed = speed;
        // if (!this._isPlayer || !this._playerStore) return;
        // this.syncWithPlayerStore();
        // Other methods related to movement speed...
    }

    get baseSpeed() {
        return this._baseSpeed;
    }

    // Calculate the total speed based on base speed and modifiers
    get maxSpeed(): number {
        return this.baseSpeed;
    }
}
