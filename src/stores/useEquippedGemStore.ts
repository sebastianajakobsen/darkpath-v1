import { defineStore } from 'pinia';
import { useActionBarStore } from '@/stores/useActionBarStore';
import { useEquipmentStore } from '@/stores/useEquipmentStore';
import cloneDeep from 'lodash/cloneDeep';
import type { IItem } from '@/phaser/items/IItem';
import { GemType, type ItemGemPropertyType } from '@/phaser/items/gems/IGem';


export const useEquippedGemStore = defineStore('gem', {
    state: () => ({
        equippedGems: {}, // Changed from gemInventory to equippedGems
    }),

    actions: {
        initialize() {
            const equipmentStore = useEquipmentStore();
            const actionBarStore = useActionBarStore();
            const unsubscribe = equipmentStore.$subscribe((mutation) => {
                // if (mutation.type === 'someRelevantMutationType') {
                this.syncEquippedGems(equipmentStore, actionBarStore);
                // }
            });
        },

        // sync equip item gems so we know what gems are able to be castet
        syncEquippedGems(equipmentStore: any, actionBarStore: any) {
            const newEquippedGems: Record<
        string,
        { gem: IItem<ItemGemPropertyType>; linkTo: number | null }[][]
      > = {};
            equipmentStore.slots.forEach((slot) => {
                const item = slot.item;
                if (item?.properties.sockets) {
                    newEquippedGems[slot.name] = newEquippedGems[slot.name] || [];
                    item.properties.sockets.forEach((socket, index) => {
                        // socket can have no gem, but should stil be part of the linked group

                        const existingGroupIndex = newEquippedGems[slot.name].findIndex((group) =>
                            group.some((g) => g.linkTo === index || index === g.linkTo),
                        );

                        const gemData = { gem: socket.gem, linkTo: socket.linkTo };

                        if (existingGroupIndex > -1) {
                            newEquippedGems[slot.name][existingGroupIndex].push(cloneDeep(gemData));
                        } else {
                            newEquippedGems[slot.name].push([cloneDeep(gemData)]);
                        }
                    });
                }
            });

            /**
       * Iterates through each equipment slot and its associated gem groups.
       * For each group, it identifies the "spell" gems and the "support" gems.
       * Support gem ,modifiers are applied to each spell gem, but each support gem's
       * modifiers are applied only once, even if there are multiple instances of the same support gem.
       * This is done to prevent duplicate application of modifiers from the same type of support gem.
       * Support gems are sorted by level to ensure that if there are duplicates the one with the highest level is applied.
       */
            Object.keys(newEquippedGems).forEach((slotName) => {
                newEquippedGems[slotName].forEach((gemGroup) => {
                    // Filter to get all spell gems
                    const spellGemData = gemGroup.filter(
                        ({ gem }) => gem?.properties?.type !== GemType.SUPPORT,
                    );

                    // Sort and filter support gems by level
                    const supportGems = gemGroup
                        .filter(({ gem }) => gem?.properties?.type === GemType.SUPPORT)
                        .sort((a, b) => (b.gem?.properties.rank ?? 0) - (a.gem?.properties.rank ?? 0));

                    spellGemData.forEach(({ gem: spellGem }) => {
                        if (spellGem) {
                            const appliedSupportGemIds = new Set<string>(); // Reset for each spell gem

                            supportGems.forEach(({ gem: supportGem }) => {
                                if (supportGem && !appliedSupportGemIds.has(supportGem.name)) {
                                    // Check for tag compatibility
                                    const hasMatchingTags = supportGem.properties.tags.some((tag) =>
                                        spellGem.properties.tags.includes(tag),
                                    );
                                    if (hasMatchingTags) {
                                        const modifiers = supportGem.properties.calculateModifiers(supportGem.properties.rank);

                                        // Apply additional projectiles if available
                                        if ('additionalProjectiles' in modifiers) {
                                            const additionalProjectiles = modifiers.additionalProjectiles;
                                            spellGem.properties.projectiles = (spellGem.properties.projectiles || 0) + additionalProjectiles;
                                        }

                                        // Apply increased cast speed if available
                                        if ('increasedCastSpeed' in modifiers) {
                                            const increasedCastSpeed = modifiers.increasedCastSpeed; // e.g., 100.5
                                            const baseCastSpeed = spellGem.properties.castSpeed; // e.g., 1500

                                            // Calculate the new cast speed with the corrected formula
                                            const newCastSpeed = baseCastSpeed / (1 + (increasedCastSpeed / 100));

                                            // Assign the new cast speed back to the spell gem properties
                                            spellGem.properties.castSpeed = newCastSpeed;
                                        }

                                        appliedSupportGemIds.add(supportGem.name);
                                    }
                                }
                            });
                        }
                    });
                });
            });

            this.equippedGems = newEquippedGems;

            const currentGems = Object.values(this.equippedGems)
                .flat()
                .flatMap((gemGroup) => gemGroup.map(({ gem }) => gem));

            const currentGemIds = new Set(currentGems.map((gem) => gem?.id));
            // Remove gems that are no longer in any socket
            Object.keys(this.equippedGems).forEach((slotName) => {
                this.equippedGems[slotName] = this.equippedGems[slotName].filter((gemGroup) => {
                    return gemGroup.some(({ gem }) => currentGemIds.has(gem?.id));
                });
            });

            const actionBarMap = new Map(
                actionBarStore.actions.map((action) => [action.assignedGem?.id, action]),
            );

            const actionsByName = Object.fromEntries(
                actionBarStore.actions.map((action) => [action.name, action]),
            );

            // remove action where gem is no longer equip
            actionBarStore.actions.forEach((action) => {
                if (action.assignedGem && !currentGemIds.has(action.assignedGem.id)) {
                    actionBarStore.removeGemFromAction(action.name);
                }
            });

            // Loop over current gems
            currentGems.forEach((gem) => {
                if (!gem) return;

                const existingAction = actionBarMap.get(gem.id);


                if (existingAction) {

                    if (JSON.stringify(existingAction.assignedGem) !== JSON.stringify(gem)) {
                        // we should only assign spell gems to actions if they are not already assigned
                        actionBarStore.assignGemToAction(existingAction.name, gem);
                    }
          
                } else if ( gem.properties?.type !== GemType.SUPPORT) {
                    const priorityOrder = ['MR', '1', '2', '3', '4', '5', 'MM', 'ML'];
                    for (const actionName of priorityOrder) {
                        const action = actionsByName[actionName];
                        if (action && action.assignedGem === null) {
                            actionBarStore.assignGemToAction(actionName, gem);
                            break;
                        }
                    }
                }
            });
        },
    },
});
