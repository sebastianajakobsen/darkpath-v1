import { FireballStrategy } from '@/phaser/actors/player/actions/FireballStrategy';

import { type ISpellGemConfig, type SpellGemItemType, SpellGemType } from '@/phaser/items/gems/spells/ISpellGem';
import type { IItem } from '@/phaser/items/IItem';
import type { Player } from '@/phaser/actors/player/Player';
import { type ActionBarAction, useActionBarStore } from '@/stores/useActionBarStore';
import { computed, watch } from 'vue';
import { ChainLightningStrategy } from '@/phaser/actors/player/actions/ChainLightningStrategy';
import { ImmolateStrategy } from '@/phaser/actors/player/actions/ImmolateStrategy';
import { type IMeleeGemConfig, MeleeGemType } from '@/phaser/items/gems/melee/IMeleeGem';
import { CleaveStrategy } from '@/phaser/actors/player/actions/CleaveStrategy';

type AttackFunction = (spellGemId: string, direction: Phaser.Math.Vector2)=> void;
// type StrategyMap = Map<string, FireballStrategy | IceboltStrategy>;
type StrategyMap = Map<string, FireballStrategy | ChainLightningStrategy >;
type AttackName =
  | 'attackML'
  | 'attackMM'
  | 'attackMR'
  | 'attack1'
  | 'attack2'
  | 'attack3'
  | 'attack4'
  | 'attack5';

export class ActionManager {
    private attackStrategies: StrategyMap = new Map();
    private attackNameToGem: Record<string, IItem<SpellGemItemType>> = {};
    private readonly gemTypeToAttackFn: Record<SpellGemType, AttackFunction>;
    private unwatchActionBar: Function | null = null;
    player!: Player;

    constructor(player: Player) {
        this.player = player;
        // Initialize the map with a generic attack function that handles all types
        this.gemTypeToAttackFn = {
            [SpellGemType.FIRE_BALL]: this.triggerAttackStrategy.bind(this),
            [SpellGemType.CHAIN_LIGHTNING]: this.triggerAttackStrategy.bind(this),
            [SpellGemType.IMMOLATE]: this.triggerAttackStrategy.bind(this),
            [MeleeGemType.ClEAVE]: this.triggerAttackStrategy.bind(this),
            // Additional spells here
        };
        this.initActionBarWatcher();
    }

    // TODO: maybe use this._ActionBarStore.$onAction(({ name, args }) => { instead??
    private initActionBarWatcher() {
        const actionBarStore = useActionBarStore();
        const assignedGemsWatcher = computed(() =>
            actionBarStore.actions.map(action => ({
                name: action.name,
                assignedGem: action.assignedGem,
            })),
        );

        this.unwatchActionBar = watch(assignedGemsWatcher, (newActions, oldActions) => {
            this.updateActionBarActions(newActions, oldActions);
        }, { deep: true });
    }

    public attacks: Record<AttackName, (direction: Phaser.Math.Vector2)=> void> = {
        attackML: () => {},
        attackMM: () => {},
        attackMR: () => {},
        attack1: () => {},
        attack2: () => {},
        attack3: () => {},
        attack4: () => {},
        attack5: () => {},
    };

    private updateActionBarActions(newActions: ActionBarAction[], oldActions: ActionBarAction[]) {
        newActions.forEach((action, index) => {
            const oldAction = oldActions[index];
            // Check if the assignedGem has changed
            if (JSON.stringify(action.assignedGem) !== JSON.stringify(oldAction.assignedGem)) {
                console.log('not the same');

                const attackName = `attack${action.name}` as AttackName;

                // If there was a gem assigned previously, remove the old strategy
                if (oldAction.assignedGem) {
                    this.clearStrategy(attackName, oldAction.assignedGem);
                }

                // If there is a new gem, assign it
                if (action.assignedGem) {
                    this.assignGem(action.assignedGem, attackName);
                } else {
                    // If no new gem is assigned, ensure to reset the attack function
                    this.attacks[attackName] = () => {};
                }
            }
        });
    }

    private clearStrategy(attackName: AttackName, gem: IItem<SpellGemItemType>) {
        const strategyToBeRemoved = this.attackStrategies.get(gem.id);
        if (strategyToBeRemoved) {
            strategyToBeRemoved.destroy();
            this.attackStrategies.delete(gem.id);
        }
        delete this.attackNameToGem[attackName];
        this.attacks[attackName] = () => {}; // Reset the attack function directly here
    }


    private updateAttackStrategy(spellGem: IItem<ISpellGemConfig>, exists: boolean, attackName: AttackName) {
        let strategy = this.attackStrategies.get(spellGem.id);
        if (exists) {
            if (!strategy) {
                strategy = this.createAttackStrategy(spellGem);
                this.attackStrategies.set(spellGem.id, strategy);
            }
        } else {
            strategy?.destroy();
            this.attackStrategies.delete(spellGem.id);
        }
        this.setAttackFunction(attackName, strategy?.trigger.bind(strategy) || (() => {}));
    }


    private assignGem(spellGem: IItem<SpellGemItemType>, attackName: AttackName) {
        this.attackNameToGem[attackName] = spellGem;
        this.updateAttackStrategy(spellGem, true, attackName);
    }



    private clearStrategies() {
        for (const [attackName, gem] of Object.entries(this.attackNameToGem)) {
            const strategyToBeRemoved = this.attackStrategies.get(gem.id);

            console.log('strategyToBeRemoved', strategyToBeRemoved);

            if (strategyToBeRemoved) {
                strategyToBeRemoved.destroy();
                this.attackStrategies.delete(gem.id);
            }
            delete this.attackNameToGem[attackName];

            this.attacks[attackName] = () => {}; // Reset the attack function directly here
        }
    }

    private setAttackFunction(attackName: AttackName, attackFunction: AttackFunction | null) {
        this.attacks[attackName] = attackFunction || (() => {});
    }

    private createAttackStrategy(spellGem: IItem<ISpellGemConfig | IMeleeGemConfig>) {
        switch (spellGem.properties.subType) {
        case SpellGemType.FIRE_BALL:
            return new FireballStrategy(this.player, spellGem);
        case SpellGemType.CHAIN_LIGHTNING:
            return new ChainLightningStrategy(this.player, spellGem);
        case SpellGemType.IMMOLATE:
            return new ImmolateStrategy(this.player, spellGem);
        case MeleeGemType.ClEAVE:
            return new CleaveStrategy(this.player, spellGem);
        default:
            throw new Error(`Invalid gemType: ${spellGem.properties.subType}`);
        }
    }

    private triggerAttackStrategy(spellGemId: string, direction: Phaser.Math.Vector2) {
        if (!this.player.isAlive()) return;
        const strategy = this.attackStrategies.get(spellGemId);
        if (strategy) {
            strategy.trigger(direction);
        }
    }

    update() {
        // call the strategy update method
        for (const strategy of this.attackStrategies.values()) {
            strategy.update();
        }
    }

    // Clean up watchers when no longer needed
    destroy() {
        if (this.unwatchActionBar) {
            this.unwatchActionBar();
        }
    }
}
