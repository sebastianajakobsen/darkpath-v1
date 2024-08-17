import { defineStore } from 'pinia';
import type { IItem } from '@/phaser/items/IItem';
import type { ISpellGemConfig } from '@/phaser/items/gems/spells/ISpellGem';


export interface ActionBarAction {
    name: string;
    gridArea: string;
    assignedGem: IItem<ISpellGemConfig> | null;
    cooldown: number;
    initCooldown: number;
    isActive: boolean;
}

export const useActionBarStore = defineStore('actionBar', {
    state: () => ({
        actions: [
            { name: 'ML', gridArea: 'top-left', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false },
            { name: 'MM', gridArea: 'top-middle', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            { name: 'MR', gridArea: 'top-right', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            { name: '1', gridArea: 'bottom-1', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            { name: '2', gridArea: 'bottom-2', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            { name: '3', gridArea: 'bottom-3', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            { name: '4', gridArea: 'bottom-4', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            { name: '5', gridArea: 'bottom-5', assignedGem: null, cooldown: 0, initCooldown: 0, isActive: false  },
            // ... more actions
        ] as ActionBarAction[],
    }),

    actions: {
        assignGemToAction(actionName: string, spellGem: IItem<ISpellGemConfig>) {
            const action = this.actions.find((a) => a.name === actionName);
            if (action) {
                action.assignedGem = spellGem;
                action.cooldown =  1000; // always 1 sec
                action.initCooldown++;
                action.isActive = false;
            }
        },

        removeGemFromAction(actionName: string) {
            const action = this.actions.find((a) => a.name === actionName);
            if (action) {
                action.assignedGem = null;
                action.initCooldown++;
                action.isActive = false;
            }
        },

        initiateCooldown(spellType: string, cooldown: number) {
            this.actions.forEach(action => {
                if (action.assignedGem && action.assignedGem.properties.subType === spellType) {
                    action.cooldown = cooldown; // Set the cooldown
                    action.initCooldown++; // Increment to trigger UI updates or animations
                }
            });
        },

        getActionByKey(actionName: string) {
            return this.actions.find(a => a.name === actionName);
        },

        setActiveAction(id: string, isActive: boolean) {
            this.actions.forEach(action => {
                if (action.assignedGem && action.assignedGem.id === id) {
                    action.isActive = isActive;
                }
            });
        },

    },
});
