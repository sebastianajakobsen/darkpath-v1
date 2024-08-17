import { defineStore } from 'pinia';
import { type IItem, ItemEquipmentType } from '@/phaser/items/IItem';
import { usePlayerStore } from '@/stores/usePlayerStore';

export enum EquipmentSlotType {
  HELMET = 'Helmet',
  GLOVES = 'Gloves',
  BODY_ARMOR = 'BodyArmor',
  BELT = 'Belt',
  BOOTS = 'Boots',

  WEAPON = 'Weapon',
  OFFHAND = 'Offhand',

  AMULET = 'Amulet',
  RING1 = 'Ring1',
  RING2 = 'Ring2'
}

interface EquipmentSlot {
  name: EquipmentSlotType;
  item: null | IItem<any>;
  type: ItemEquipmentType;
}

function findSlotByName(slots: EquipmentSlot[], name: EquipmentSlotType) {
    return slots.find((slot) => slot.name === name);
}
function findRingSlot(slots: EquipmentSlot[]): EquipmentSlot | null {
    const ring1Slot = findSlotByName(slots, EquipmentSlotType.RING1);
    const ring2Slot = findSlotByName(slots, EquipmentSlotType.RING2);

    if (!ring1Slot?.item) return ring1Slot;
    if (!ring2Slot?.item) return ring2Slot;
    return ring1Slot; // Default to RING1
}

function isSlotValid(slot: EquipmentSlot | null | undefined, item: IItem<any>): boolean {
    if (!slot) return false;

    // Check if the slot is one of the ring slots
    const isRingSlot = slot.name === EquipmentSlotType.RING1 || slot.name === EquipmentSlotType.RING2;

    return (
        item.properties.equipSlot?.includes(slot.name) ||
    (isRingSlot && item.properties.equipSlot?.includes(ItemEquipmentType.RING))
    );
}

function findRingSlotToUnequip(
    slots: EquipmentSlot[],
    item: IItem<any>,
): EquipmentSlot | undefined {
    return slots.find(
        (s) =>
            s.item &&
      s.item.id === item.id &&
      (s.name === EquipmentSlotType.RING1 || s.name === EquipmentSlotType.RING2),
    );
}

export const useEquipmentStore = defineStore('equipment', {
    state: () => ({
        slots: [
            { name: EquipmentSlotType.WEAPON, item: null, type: ItemEquipmentType.WEAPON },
            { name: EquipmentSlotType.GLOVES, item: null, type: ItemEquipmentType.GLOVES },
            { name: EquipmentSlotType.RING1, item: null, type: ItemEquipmentType.RING },
            { name: EquipmentSlotType.HELMET, item: null, type: ItemEquipmentType.HELMET },
            { name: EquipmentSlotType.BODY_ARMOR, item: null, type: ItemEquipmentType.BODY_ARMOR },
            { name: EquipmentSlotType.BELT, item: null, type: ItemEquipmentType.BELT },
            { name: EquipmentSlotType.AMULET, item: null, type: ItemEquipmentType.AMULET },
            { name: EquipmentSlotType.RING2, item: null, type: ItemEquipmentType.RING },
            { name: EquipmentSlotType.OFFHAND, item: null, type: ItemEquipmentType.OFFHAND },
            { name: EquipmentSlotType.BOOTS, item: null, type: ItemEquipmentType.BOOTS },
        ] as EquipmentSlot[],
    }),
    getters: {
        getItemInSlot: (state) => (slotName: EquipmentSlotType) => {
            const slot = state.slots.find((slot) => slot.name === slotName);
            return slot ? slot.item : null;
        },
        getGearSlot: (state) => (slotName: EquipmentSlotType) => {
            return state.slots.find((slot) => slot.name === slotName);
        },
        getEquippedItem: (state) => (applicableSlots: EquipmentSlotType[] | ItemEquipmentType[]) => {
            if (applicableSlots.includes(ItemEquipmentType.RING)) {
                const ring1Slot = state.slots.find((slot) => slot.name === EquipmentSlotType.RING1);
                const ring2Slot = state.slots.find((slot) => slot.name === EquipmentSlotType.RING2);

                if (!ring1Slot?.item || !ring2Slot?.item) {
                    return null; // Return null if one of them is empty
                }

                return ring1Slot.item; // Default to RING1
            } else {
                const slot = state.slots.find((slot) => applicableSlots.includes(slot.name));
                return slot ? slot.item : null;
            }
        },
        getEquippedSlotName: (state) => (itemId: string) => {
            const slot = state.slots.find((slot) => slot.item && slot.item.id === itemId);
            return slot ? slot.name : null;
        },
    },
    actions: {
        findItemById(itemId: string) {
            // Find the slot containing the item with the given ID
            return this.slots.find((slot) => slot.item && slot.item.id === itemId);
        },

        removeGemFromSocket(itemId: string, socketIndex: number) {
            const slot = this.findItemById(itemId);
            if (
                slot &&
        slot.item &&
        slot.item.properties.sockets &&
        slot.item.properties.sockets[socketIndex]
            ) {
                slot.item.properties.sockets[socketIndex].gem = null;
                // Any additional logic or validations can go here
            }
        },

        updateGemInSocket(itemId: string, socketIndex: number, newGem: IItem<any>) {
            const slot = this.findItemById(itemId);
            if (
                slot &&
        slot.item &&
        slot.item.properties.sockets &&
        slot.item.properties.sockets[socketIndex]
            ) {
                slot.item.properties.sockets[socketIndex].gem = newGem;
                // Any additional logic or validations can go here
            }
        },

        equipItem(item: IItem<any>, applicableSlots: EquipmentSlotType[]): boolean {
            if (!item.identified) return false;

            let targetSlot;
            const playerStore = usePlayerStore();

            if (
                item.properties.equipSlot.includes(ItemEquipmentType.RING) &&
        applicableSlots.includes(ItemEquipmentType.RING)
            ) {
                targetSlot = findRingSlot(this.slots);
            } else {
                targetSlot = this.slots.find((slot) => applicableSlots.includes(slot.name));
            }

            if (!targetSlot || !isSlotValid(targetSlot, item)) {
                return false;
            }

            // console.log(item);

            targetSlot.item = item;

            // Prepare an object to hold attribute changes
            const attributeChanges = {
                strength: playerStore.attributes.strength,
                dexterity: playerStore.attributes.dexterity,
                intelligence: playerStore.attributes.intelligence,
                vitality: playerStore.attributes.vitality,
            };

            // Apply bonuses from item affixes to the attribute changes
            item.properties.affix.forEach((affix) => {
                if (affix.bonus) {
                    Object.keys(affix.bonus).forEach((key) => {
                        if (attributeChanges.hasOwnProperty(key)) {
                            // Add the bonus to the corresponding attribute in the changes object
                            attributeChanges[key] += affix.bonus[key].current;
                        }
                    });
                }
            });

            // Update the player's attributes in the store
            playerStore.setAttributes(attributeChanges);

            return true;
        },

        unequipItem(item: IItem<any>, applicableSlots: ItemEquipmentType[]): boolean {
            let slot;
            const playerStore = usePlayerStore();
            if (
                item.properties.equipSlot.includes(ItemEquipmentType.RING) &&
        applicableSlots.includes(ItemEquipmentType.RING)
            ) {
                slot = findRingSlotToUnequip(this.slots, item);
            } else {
                slot = this.slots.find((slot) => applicableSlots.includes(slot.name));
            }

            if (!slot) return false;

            // Prepare an object to hold attribute changes
            const attributeChanges = {
                strength: playerStore.attributes.strength,
                dexterity: playerStore.attributes.dexterity,
                intelligence: playerStore.attributes.intelligence,
                vitality: playerStore.attributes.vitality,
            };

            // Remove bonuses from item affixes from the attribute changes
            item.properties.affix.forEach((affix) => {
                if (affix.bonus) {
                    Object.keys(affix.bonus).forEach((key) => {
                        if (attributeChanges.hasOwnProperty(key)) {
                            // Subtract the bonus from the corresponding attribute in the changes object
                            attributeChanges[key] -= affix.bonus[key].current;
                        }
                    });
                }
            });

            // Safeguard against attributes dropping below 1 due to unequipping items
            Object.keys(attributeChanges).forEach((key) => {
                attributeChanges[key] = Math.max(1, attributeChanges[key]);
            });

            // Update the player's attributes in the store
            playerStore.setAttributes(attributeChanges);

            slot.item = null;

            return true;
        },

        canEquipItem(item: IItem<any>, applicableSlots: EquipmentSlotType[]): boolean {
            let slot = this.slots.find((slot) => applicableSlots.includes(slot.name));

            if (slot) {
                // Check if a two-handed weapon is already equipped when trying to equip an offhand
                if (applicableSlots.includes(EquipmentSlotType.OFFHAND)) {
                    const mainWeapon = this.slots.find(
                        (slot) => slot.name === EquipmentSlotType.WEAPON,
                    )?.item;
                    if (mainWeapon?.properties.handType === HandType.TWO_HANDED) {
                        return false;
                    }
                }

                // Check if an offhand item is already equipped when trying to equip a two-handed weapon
                if (
                    applicableSlots.includes(EquipmentSlotType.WEAPON) &&
          item.properties.handType === HandType.TWO_HANDED
                ) {
                    const offhand = this.slots.find((slot) => slot.name === EquipmentSlotType.OFFHAND)?.item;
                    if (offhand) {
                        return false;
                    }
                }
            } else if (!slot && applicableSlots.includes(ItemEquipmentType.RING)) {
                const ring1Slot = this.slots.find((slot) => slot.name === EquipmentSlotType.RING1);
                const ring2Slot = this.slots.find((slot) => slot.name === EquipmentSlotType.RING2);

                // Pick the empty slot, if available.
                if (!ring1Slot?.item) {
                    slot = ring1Slot; // Return RING1 if it's empty
                }
                if (!ring2Slot?.item) {
                    slot = ring2Slot; // Return RING2 if it's empty
                }

                // Default to RING1 if both are empty or both are filled.
                slot = ring1Slot;
            }

            return isSlotValid(slot, item);
        },
    },
});
